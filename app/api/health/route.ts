import { NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export async function GET() {
  let supabaseReachable = false;

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.auth.getSession();
      supabaseReachable = !error;
    } catch {
      supabaseReachable = false;
    }
  }

  return NextResponse.json({
    status: "ok",
    app: "Christian Homeschools Hub",
    supabaseConfigured: isSupabaseConfigured,
    supabaseReachable,
    timestamp: new Date().toISOString(),
  });
}
