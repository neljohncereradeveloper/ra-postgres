import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getToken } from "@/lib/auth/auth-utils";
import { API_BASE_URL } from "@/lib/constants/api.constants";

// Validate update request body schema
const districtSchema = z.object({
  desc1: z.string().min(3),
});

// PATCH handler for updating an district
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();

    // Validate request body
    const validatedData = districtSchema.parse(body);

    // Get auth token
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Forward the validated request to the external API
    const response = await fetch(`${API_BASE_URL}/districts/${id}`, {
      method: "PATCH",
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
            `Failed to update district: ${response.statusText}`,
        },
        { status: response.status }
      );
    }
    // Parse and return the response
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Return validation errors
      return NextResponse.json(
        { error: "Validation failed", details: error.format() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update district" },
      { status: 500 }
    );
  }
}
