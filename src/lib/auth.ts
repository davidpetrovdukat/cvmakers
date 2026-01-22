import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTHORIZE START]: Attempting to sign in user...");

        if (!credentials?.email || !credentials?.password) {
          console.error("[AUTHORIZE FAIL]: Missing email or password.");
          throw new Error("Invalid credentials");
        }

        try {
          console.log(
            `[AUTHORIZE STEP 1]: Searching for user with email: ${credentials.email}`,
          );
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
          });

          if (!user || !user.password) {
            console.error(
              `[AUTHORIZE FAIL]: User not found or password not set for email: ${credentials.email}`,
            );
            throw new Error("Invalid credentials");
          }

          console.log(`[AUTHORIZE STEP 2]: User found. Comparing passwords...`);
          const isCorrectPassword = await bcrypt.compare(
            credentials.password,
            user.password,
          );

          if (!isCorrectPassword) {
            console.error(
              `[AUTHORIZE FAIL]: Password incorrect for email: ${credentials.email}`,
            );
            throw new Error("Invalid credentials");
          }

          console.log(
            `[AUTHORIZE SUCCESS]: Passwords match for user: ${user.id}. Returning user object.`,
          );
          return user;
        } catch (error: any) {
          // Handle database connection errors gracefully
          if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1003') {
            console.error("[AUTHORIZE FAIL]: Database connection error:", error.message);
            throw new Error("Service temporarily unavailable. Please try again later.");
          }
          // Re-throw other errors (like Invalid credentials)
          throw error;
        }
      },
    }),
  ],
  debug: process.env.NODE_ENV === "development",
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tokenBalance = (user as any).tokenBalance ?? 0;
        token.currency = (user as any).currency ?? "GBP";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id;
        (session.user as any).tokenBalance = token.tokenBalance;
        (session.user as any).currency = token.currency;
      }
      return session;
    },
  },
};
