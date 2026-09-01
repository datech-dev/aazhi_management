import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protect all routes except public ones
  matcher: [
    "/((?!api/webhooks|_next/static|_next/image|favicon.ico|fonts|images|login).*)",
  ],
};
