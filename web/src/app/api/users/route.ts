import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth/auth-utils";
import { z } from "zod";
import { API_BASE_URL } from "@/lib/constants/api.constants";

// Validate request body schema for creating users
const userSchema = z.object({
  watcher: z.string().min(3, { message: "Watcher is required" }),
  precinct: z.string().min(3, { message: "Precinct is required" }),
  applicationAccess: z.string().optional(),
  userRoles: z.string().min(1, { message: "User role is required" }),
  userName: z.string().min(1, { message: "Username is required" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// GET handler for fetching users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term") || "";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "100";

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = `${API_BASE_URL}/users?term=${encodeURIComponent(
      term
    )}&page=${page}&limit=${limit}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // Prevent caching
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch users: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// POST handler for creating users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        {
          error:
            errorData?.message ||
            `Failed to create user: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Parse and return the response
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
