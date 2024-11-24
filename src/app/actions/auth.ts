"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { profiles, type Profile } from "@/db/schema";
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

/**
 * Fetches the user profile based on the authenticated user.
 * @returns {Promise<ActionResponse<{ user: Profile }>>} The user profile or an error response.
 */
export async function getProfile(): Promise<ActionResponse<{ user: Profile }>> {
  try {
    const { userId } = await auth();

    if (!userId)
      return {
        success: false,
        error: "Not authenticated",
      };

    // Fetch the user profile
    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.user_id, userId),
    });

    // Create new user if doesn't exist
    if (!userProfile) {
      const insertResult = await db.insert(profiles).values({
        user_id: userId,
      });

      console.log("Insert result:", insertResult);
      if (!insertResult)
        return {
          success: false,
          error: "Failed to insert user",
        };
    }

    // Fetch the newly created user profile
    const newUser = await db.query.profiles.findFirst({
      where: eq(profiles.user_id, userId),
    });

    if (!newUser)
      return {
        success: false,
        error: "Failed to fetch user profile",
      };

    return {
      success: true,
      data: { user: newUser },
    };
  } catch (error) {
    console.error("Error in getProfile:", error);
    return {
      success: false,
      error: "Failed to fetch user profile",
    };
  }
}
