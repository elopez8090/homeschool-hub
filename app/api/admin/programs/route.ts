// app/api/admin/programs/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// GET - Fetch programs with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const search = searchParams.get("search");

    let query = supabase
      .from("programs")
      .select("*")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (state) {
      query = query.eq("state", state);
    }

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,contact_email.ilike.%${search}%,city.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ programs: data || [] });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 }
    );
  }
}

// POST - Create new program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("Received data:", body);

    // Validate required fields
    if (!body.name || !body.state || !body.city || !body.category || !body.contact_email) {
      return NextResponse.json(
        { error: "Missing required fields: name, state, city, category, contact_email" },
        { status: 400 }
      );
    }

    const insertData = {
      name: body.name,
      state: body.state,
      city: body.city,
      category: body.category,
      contact_email: body.contact_email,
      phone: body.phone || null,
      website: body.website || null,
      description: body.description || null,
      featured: body.featured === true ? true : false,
    };

    console.log("Inserting data:", insertData);

    const { data, error } = await supabase
      .from("programs")
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log("Created program:", data);
    return NextResponse.json({ program: data }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating program:", errorMessage);
    return NextResponse.json(
      { error: `Failed to create program: ${errorMessage}` },
      { status: 500 }
    );
  }
}
