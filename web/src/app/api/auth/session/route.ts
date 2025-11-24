import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "@/lib/auth/types";
import { clearAuthCookie, getToken } from "@/lib/auth/auth-utils";

export async function GET() {
  try {
    // Get the token from cookies
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
      // Decode the JWT token
      const decoded = jwtDecode<JwtPayload>(token);
      if (!decoded || typeof decoded !== "object") {
        clearAuthCookie();
        return NextResponse.json({ authenticated: false }, { status: 401 });
      }

      // Return the decoded user data
      return NextResponse.json({
        authenticated: true,
        user: {
          name: decoded.name,
          sub: decoded.sub,
          userRoles: decoded.userRoles,
          applicationAccess: decoded.applicationAccess,
        },
      });
    } catch (decodeError) {
      clearAuthCookie();
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to verify session" },
      { status: 500 }
    );
  }
}
