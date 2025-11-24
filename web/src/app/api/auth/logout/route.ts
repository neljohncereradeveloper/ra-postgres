import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/auth-utils";

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}
