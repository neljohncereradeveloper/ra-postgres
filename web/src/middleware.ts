import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "./lib/auth/auth-utils";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken();

  // Special case for root path - redirect to dashboard if token exists, otherwise to login
  if (pathname === "/") {
    const url = new URL(token ? "/dashboard" : "/login", request.url);
    return NextResponse.redirect(url, { status: 303 });
  }

  // Special case for login page - if token exists, redirect to dashboard
  if (pathname === "/login" && token) {
    const url = new URL("/dashboard", request.url);
    url.searchParams.set("ts", Date.now().toString());
    return NextResponse.redirect(url, {
      status: 303,
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  }

  return NextResponse.next();
}

// Configure the paths that the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. Static files (images, JS, CSS, fonts, etc.)
     * 2. favicon.ico, robots.txt, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|css|woff|woff2)).*)",
  ],
};
