"use server";

import { db } from "@/db";
import { images, imageLikes } from "@/db/schema";
import { supabase } from "@/lib/supabase";
import { eq, and, sql } from "drizzle-orm";
import Replicate from "replicate";
import { ActionResponse } from "@/types/actions";
import { ensureUserExists } from "./auth";

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
    const userResult = await ensureUserExists();
    if (!userResult.success)
      return {
        success: false,
        error: userResult.error,
      };

    const { userId } = userResult.data ?? {};
    if (!userId)
      return {
        success: false,
        error: "User ID not found",
      };

    // Generate image using Replicate
    const output: string[] = (await replicate.run(
      "fpsorg/image:2489b7892129c47ec8590fd3e86270b8804f2ff07faeae8c306342fad2f48df6",
      {
        input: {
          model: "dev",
          prompt,
          lora_scale: 1,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          guidance_scale: 3.5,
          output_quality: 90,
          prompt_strength: 0.8,
          extra_lora_scale: 1,
          num_inference_steps: 28,
        },
      }
    )) as string[];

    if (!output || !output[0])
      return {
        success: false,
        error: "Failed to generate image",
      };

    const imageUrl = output[0];

    // Upload to Supabase storage
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const fileName = `${userId}/${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage.from("images").upload(fileName, blob);

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(fileName);

    // Save to database
    await db.insert(images).values({
      image_url: publicUrl,
      prompt,
      creator_user_id: userId,
    });

    return {
      success: true,
      data: {
        imageUrl: publicUrl,
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
  imageId: number;
}

export async function toggleLike({
  imageId,
}: ToggleLikeParams): Promise<ActionResponse<{ liked: boolean }>> {
  try {
    const userResult = await ensureUserExists();
    if (!userResult.success)
      return {
        success: false,
        error: userResult.error,
        data: {
          liked: false,
        },
      };

    const { userId } = userResult.data ?? {};
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
