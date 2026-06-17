import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const { data, error } = await getSupabaseAdmin()
    .from("sites")
    .select("id, business_name, sector, slug, is_published, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ sites: data });
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const { business_name, sector, phone, description, html_content, slug } =
    await request.json();

  const { data, error } = await getSupabaseAdmin()
    .from("sites")
    .insert({ user_id: userId, business_name, sector, phone, description, html_content, slug })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ site: data }, { status: 201 });
}
