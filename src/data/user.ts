import { auth } from "@/auth";
import { db } from "@/lib/db";

export const findUserByEmail = async (email: string) =>
  await db.users.findFirst({ where: { email } });

export const findUserById = async (id: string) =>
  await db.users.findUnique({ where: { id } });

export const findUserPlayerId = async (playerId: string) =>
  await db.users.findUnique({ where: { playerId } });

export const findCurrentUser = async () => {
  const session = await auth();
  return session?.user;
};

export const findAdmin = async () => await db.admin.findFirst({ where: {} });
