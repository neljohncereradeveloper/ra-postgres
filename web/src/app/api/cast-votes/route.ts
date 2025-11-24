import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getToken } from "@/lib/auth/auth-utils";
import { API_BASE_URL } from "@/lib/constants/api.constants";

// GET handler for fetching candidates
export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Construct URL with query parameters
    const url = `${API_BASE_URL}/candidates/cast-vote`;
    // Forward the request to the external API
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // Candidate caching
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch castvotes candidates: ${response.statusText}`,
        },
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

const castVoteSchema = z.object({
  controlNumber: z.string().min(1),
  candidates: z.array(z.object({ id: z.number() })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validate request body
    const validatedData = castVoteSchema.parse(body);
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/cast-vote`, {
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
            errorData?.message || `Failed to cast vote: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    // Parse and return the response (handle empty body)
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = null;
    }
    return NextResponse.json(data ?? {}, { status: 201 });
  } catch (error) {
    console.log("error", error);
    if (error instanceof z.ZodError) {
      // Return validation errors
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
