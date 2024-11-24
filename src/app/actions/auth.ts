"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ActionResponse } from "@/types/actions";

/**
 * Ensures a user profile exists in the database after Clerk authentication
 * Creates a new profile if one doesn't exist
 */
export async function ensureUserExists(): Promise<ActionResponse<{ userId: string }>> {
  try {
    const { userId } = await auth();

    if (!userId)
      return {
        success: false,
        error: "Not authenticated",
      };

    // Check if user exists
    const existingUser = await db.query.profiles.findFirst({
      where: eq(profiles.user_id, userId),
    });

    if (existingUser)
      return {
        success: true,
        data: { userId },
      };

    // Create new user if doesn't exist
    await db.insert(profiles).values({
      user_id: userId,
      // Other fields will use defaults defined in schema
    });

    return {
      success: true,
      data: { userId },
    };
  } catch (error) {
    console.error("Error in ensureUserExists:", error);
    return {
      success: false,
      error: "Failed to verify/create user profile",
    };
  }
}
