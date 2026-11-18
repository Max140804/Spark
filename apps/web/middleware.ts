import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const path = req.nextUrl.pathname;

    const roleHome: Record<string, string> = {
      PUPIL: "/pupil",
      TEACHER: "/teacher",
      PARENT: "/parent",
      ADMIN: "/admin",
    };

    // Role route protection
    const roleRoutes: Record<string, string> = {
      "/pupil": "PUPIL",
      "/teacher": "TEACHER",
      "/parent": "PARENT",
      "/admin": "ADMIN",
    };

    for (const [route, requiredRole] of Object.entries(roleRoutes)) {
      if (path.startsWith(route) && role !== requiredRole) {
        const home = role ? roleHome[role as string] : "/login";
        return NextResponse.redirect(new URL(home ?? "/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: [
    "/pupil/:path*",
    "/teacher/:path*",
    "/parent/:path*",
    "/admin/:path*",
  ],
};