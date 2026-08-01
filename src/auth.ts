import NextAuth from "next-auth";
import { db } from "./lib/db";
import { findUserById } from "./data/user";
import authConfig from "./auth.config";

export const { signIn, signOut, auth, handlers } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },

  callbacks: {
    async jwt({ token }) {
      if (!token.sub) return token;

      const user = await findUserById(token.sub);
      if (!user) return {};

      // Existing JWT version doesn't match DB -> invalidate
      if (
        token.tokenVersion !== undefined &&
        token.tokenVersion !== user.tokenVersion
      ) {
        return {};
      }

      // Only set it when the token is first created
      if (token.tokenVersion === undefined) {
        token.tokenVersion = user.tokenVersion;
      }

      token.role = user.role;

      return token;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        const user = await db.users.findUnique({
          where: { id: token.sub },
          include: { wallet: true, bonusWallet: true },
        });

        if (!user) {
          return session; // User no longer exists
        }

        // 🔒 CHECK: If database tokenVersion is higher than token's version, invalidate session
        if (user.tokenVersion !== token.tokenVersion) {
          // Returning an empty object or null invalidates the NextAuth session
          return {
            ...session,
            user: undefined as any,
            expires: new Date(0).toISOString(),
          };
        }

        if (user.password) {
          user.password = "";
        }

        session.user = { ...user, emailVerified: new Date() };
      }
      return session;
    },
  },

  trustHost: true,
});
