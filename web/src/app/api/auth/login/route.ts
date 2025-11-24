import { NextResponse } from "next/server";
import type { LoginCredentials } from "@/lib/auth/types";
import { setCookie } from "cookies-next/server";
import { TOKEN_NAME } from "@/lib/constants/auth.constants";
import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/constants/api.constants";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginCredentials;
    if (!body.username || !body.password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let errorMessage = `Login failed with status ${res.status}`;
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
        throw new Error(errorMessage);
      }
      const data = await res.json();
      const response = NextResponse.json({ user: data.payload });
      await setCookie(TOKEN_NAME, data.token, { cookies });

      return response;
    } catch (loginError) {
      const errorMessage =
        loginError instanceof Error ? loginError.message : "Login failed";
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "An unexpected error occurred during login",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
