"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { images, imageLikes } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { eq, and, sql } from "drizzle-orm";
import Replicate from "replicate";
import { ActionResponse } from "@/types/actions";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

interface GenerateImageParams {
  prompt: string;
}

export async function generateImage({
  prompt,
}: GenerateImageParams): Promise<ActionResponse<{ imageUrl: string }>> {
  try {
    // Ensure user exists and get userId
    const { userId } = await auth();

    if (!userId)
      return {
        success: false,
        error: "User is not authenticated",
      };

    // Generate image using Replicate
    const outputArray = (await replicate.run("black-forest-labs/flux-schnell", {
      input: {
        prompt,
        disable_safety_checker: true,
      },
    })) as ReadableStream<Uint8Array>[];

    // Read the stream to get the image URL
    const output = outputArray[0];
    const reader = output.getReader();
    const chunks: Uint8Array[] = [];
    let done = false;

    // Read all chunks from the stream
    while (!done) {
      const { value, done: isDone } = await reader.read();
      if (value) chunks.push(value);
      done = isDone;
    }

    // Combine chunks into a single Uint8Array
    const imageData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let position = 0;
    for (const chunk of chunks) {
      imageData.set(chunk, position);
      position += chunk.length;
    }

    // Create a Blob from the Uint8Array
    const blob = new Blob([imageData], { type: "image/webp" });
    const imageUrl = URL.createObjectURL(blob);

    if (!imageUrl)
      return {
        success: false,
        error: "Failed to generate image",
      };

    // Convert Blob to File for Supabase upload
    const file = new File([blob], `generated-image-${Date.now()}.webp`, { type: "image/webp" });

    // Upload the image to Supabase
    const { data, error } = await supabase.storage.from("images").upload(`${file.name}`, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      console.error("Error uploading image to Supabase:", error);
      return {
        success: false,
        error: "Failed to upload image to Supabase",
      };
    }

    // Add record to the images table
    const imageRecord = await db.insert(images).values({
      image_url: data.fullPath, // Use the full path from Supabase
      prompt,
      creator_user_id: userId, // Use the authenticated user's ID
    });

    if (!imageRecord)
      return {
        success: false,
        error: "Failed to insert image record",
      };

    return {
      success: true,
      data: {
        imageUrl: data.fullPath,
      },
    };
  } catch (error) {
    console.error("Error generating image:", error);
    return {
      success: false,
      error: "Failed to generate and save image",
    };
  }
}

interface ToggleLikeParams {
  imageId: string;
}

export async function toggleLike({
  imageId,
}: ToggleLikeParams): Promise<ActionResponse<{ liked: boolean }>> {
  try {
    const { userId } = await auth();
    if (!userId)
      return {
        success: false,
        error: "User ID not found",
        data: {
          liked: false,
        },
      };

    // Check if like exists
    const existingLike = await db.query.imageLikes.findFirst({
      where: and(eq(imageLikes.image_id, imageId), eq(imageLikes.user_id, userId)),
    });

    if (existingLike) {
      // Unlike
      await db
        .delete(imageLikes)
        .where(and(eq(imageLikes.image_id, imageId), eq(imageLikes.user_id, userId)));

      // Decrement likes count
      await db
        .update(images)
        .set({ likes_count: sql`${images.likes_count} - 1` })
        .where(eq(images.id, imageId));

      return {
        success: true,
        data: { liked: false },
      };
    } else {
      // Like
      await db.insert(imageLikes).values({
        image_id: imageId,
        user_id: userId,
      });

      // Increment likes count
      await db
        .update(images)
        .set({ likes_count: sql`${images.likes_count} + 1` })
        .where(eq(images.id, imageId));

      return {
        success: true,
        data: { liked: true },
      };
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return {
      success: false,
      error: "Failed to toggle like",
    };
  }
}
