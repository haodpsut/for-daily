/**
 * Edge-safe auth config — NO database access, NO providers with DB queries.
 * Imported by middleware.ts (Edge Runtime) AND auth.ts (Node Runtime).
 * Full config with Credentials provider lives in auth.ts.
 */
import type { NextAuthConfig } from "next-auth";

export type UserRole = "admin" | "editor" | "member";

export default {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: { signIn: "/login" },
  providers: [], // Filled in auth.ts (Node-only — Credentials needs DB)
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
