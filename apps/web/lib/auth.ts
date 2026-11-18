import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { consumeRateLimit, getRequestIdentity } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const requestIdentity = getRequestIdentity(new Headers(req.headers));
        const [ipLimit, emailLimit] = await Promise.all([
          consumeRateLimit("sign-in-ip", requestIdentity, 30, 60 * 60 * 1000),
          consumeRateLimit(
            "sign-in-email",
            parsed.data.email.toLowerCase(),
            10,
            60 * 60 * 1000,
          ),
        ]);
        if (!ipLimit.allowed || !emailLimit.allowed) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user || !user.isActive || !user.emailVerified) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          authVersion: user.authVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const userId = user?.id ?? token.id;
      if (!userId) return token;

      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          role: true,
          authVersion: true,
          isActive: true,
          emailVerified: true,
        },
      });
      if (
        !currentUser ||
        !currentUser.isActive ||
        !currentUser.emailVerified ||
        (token.authVersion !== undefined &&
          token.authVersion !== currentUser.authVersion)
      ) {
        token.id = "";
        token.role = "PUPIL";
        token.authVersion = -1;
        return token;
      }

      token.id = currentUser.id;
      token.role = currentUser.role;
      token.authVersion = currentUser.authVersion;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};