import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth/auth-utils";

// This is a direct route that doesn't get processed by middleware
// It will check if a token exists and provide a backdoor to access
// protected pages directly
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get("to") || "/dashboard";

  const token = await getToken();
  const hasToken = !!token;

  // If token exists, return a redirect to the target page
  // with a special flag to bypass middleware checks
  if (hasToken) {
    // Create a response with a direct redirect
    return NextResponse.redirect(new URL(redirectTo, request.url), {
      headers: {
        // Set a header that can be checked by client-side code
        "X-Bypass-Auth": "1",

        // Use 303 status to ensure no caching
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
      status: 303,
    });
  }

  // If no token, redirect to login
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 303,
  });
}
