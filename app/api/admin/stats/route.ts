import { NextRequest, NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin-stats";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const refresh = request.nextUrl.searchParams.get("refresh") === "1";
    const stats = await getAdminStats({ refresh });
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error loading admin stats:", error);
    return NextResponse.json({ error: "Failed to load admin stats." }, { status: 500 });
  }
}
