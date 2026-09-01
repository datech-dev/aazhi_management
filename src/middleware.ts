import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect all routes except public ones, api/auth, and webhooks
  matcher: [
    "/((?!api/auth|api/webhooks|_next/static|_next/image|favicon.ico|fonts|images|login).*)",
  ],
};
