"use server";

import { signOut, auth } from "@/auth";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { db } from "@/lib/db";
import { isRedirectError } from "next/dist/client/components/redirect-error";
export const logout = async () => {
  try {
    await signOut({ redirect: true, redirectTo: "/" });

    return { success: true };
  } catch {
    return { error: INTERNAL_SERVER_ERROR };
  }
};

export async function logoutAllDevices() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Increment tokenVersion in DB — invalidating all existing JWTs across all devices
    await db.users.update({
      where: { id: session.user.id },
      data: {
        tokenVersion: {
          increment: 1,
        },
      },
    });

    // Triggers Next.js internal redirect error
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    // 💡 RE-THROW NEXT_REDIRECT ERRORS
    if (isRedirectError(error)) {
      throw error;
    }

    console.error("Actual logout error:", error);
    return { error: "Failed to log out" };
  }
}
