import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth/auth-utils";
import { z } from "zod";
import { API_BASE_URL } from "@/lib/constants/api.constants";

const settingSchema = z.object({
  electionName: z.string().min(1, { message: "Election name is required" }),
});

// PATCH handler for starting the active election
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = settingSchema.parse(body);

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const response = await fetch(`${API_BASE_URL}/settings/set-active`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json", // Include content type even if body is empty
      },
      body: JSON.stringify(validatedData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        {
          error:
            errorData?.message ||
            `Failed to update settings: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "An unexpected error occurred while updating settings" },
      { status: 500 }
    );
  }
}
