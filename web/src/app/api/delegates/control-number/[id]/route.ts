import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth/auth-utils";
import { API_BASE_URL } from "@/lib/constants/api.constants";

// PATCH handler for updating an candidate
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;

    // Get auth token
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Forward the validated request to the external API
    const response = await fetch(
      `${API_BASE_URL}/delegates/control-number/${id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch delegate with control number: ${response.statusText}`,
        },
        { status: response.status }
      );
    }
    // Parse and return the response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch delegate with control number" },
      { status: 500 }
    );
  }
}
