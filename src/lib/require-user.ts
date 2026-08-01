import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user || session.error) {
    redirect("/login");
  }
  return session.user;
}
