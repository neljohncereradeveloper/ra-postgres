import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth/auth-utils";
import { API_BASE_URL } from "@/lib/constants/api.constants";

// GET handler for fetching elections
export async function GET() {
  try {
    // Get auth token
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Construct URL with query parameters
    const url = `${API_BASE_URL}/elections/scheduled`;
    // Forward the request to the external API
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // Prevent caching
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch elections: ${response.statusText}` },
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
