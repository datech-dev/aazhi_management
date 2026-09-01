import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            hashedPassword: true,
            role: true,
            isActive: true,
            branchId: true,
            avatarUrl: true,
          },
        });

        if (!user || !user.isActive) return null;

        const isValidPassword = await bcrypt.compare(password, user.hashedPassword);
        if (!isValidPassword) return null;

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatarUrl,
          role: user.role,
          branchId: user.branchId,
        };
      },
    }),
  ],
});

/**
 * Get the current authenticated user with role info.
 * Use in Server Components and Server Actions.
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return {
    id: session.user.id,
    email: session.user.email!,
    name: session.user.name!,
    role: (session.user as { role?: string }).role as string,
    branchId: (session.user as { branchId?: string }).branchId as string | null,
  };
}

/**
 * Require authentication — throws if not logged in.
 * Use at the top of server actions and API routes.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
