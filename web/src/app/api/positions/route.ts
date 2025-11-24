import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getToken } from "@/lib/auth/auth-utils";
import { API_BASE_URL } from "@/lib/constants/api.constants";

// Validate request body schema
const positionSchema = z.object({
  desc1: z.string().min(3),
  maxCandidates: z.coerce.number().min(1), // coerce to number
  termLimit: z.string().min(1),
});

// GET handler for fetching positions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term") || "";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "100";

    // Get auth token
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Construct URL with query parameters
    const url = `${API_BASE_URL}/positions?term=${encodeURIComponent(
      term
    )}&page=${page}&limit=${limit}`;
    // Forward the request to the external API
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // Position caching
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch positions: ${response.statusText}` },
        { status: response.status }
      );
    }

    // Parse and return the response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

// POST handler for creating positions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate request body
    const validatedData = positionSchema.parse(body);
    // Get auth token
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Forward the validated request to the external API
    const response = await fetch(`${API_BASE_URL}/positions`, {
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
            `Failed to create position: ${response.statusText}`,
        },
        { status: response.status }
      );
    }
    // Parse and return the response
    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create position" },
      { status: 500 }
    );
  }
}
