import { NextResponse } from "next/server";
import { getToken } from "@/lib/auth/auth-utils";
import { API_BASE_URL } from "@/lib/constants/api.constants";

// GET handler for fetching settings
export async function GET() {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/settings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { revalidate: 0 }, // Prevent caching
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch settings: ${response.statusText}` },
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
