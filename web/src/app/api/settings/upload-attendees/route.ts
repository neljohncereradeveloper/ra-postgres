import { NextRequest, NextResponse } from "next/server";
import { getToken } from "@/lib/auth/auth-utils";
import { z } from "zod";
import { API_BASE_URL } from "@/lib/constants/api.constants";

// POST handler for uploading a file
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");

    const fileSchema = z.instanceof(File);
    fileSchema.parse(file);

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const forwardFormData = new FormData();
    forwardFormData.append("file", file as File);

    const response = await fetch(`${API_BASE_URL}/delegates/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: forwardFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        {
          error:
            errorData?.message ||
            `Failed to create upload attendees: ${response.statusText}`,
        },
        { status: response.status }
      );
    }

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
      { error: "Failed to create upload attendees" },
      { status: 500 }
    );
  }
}
