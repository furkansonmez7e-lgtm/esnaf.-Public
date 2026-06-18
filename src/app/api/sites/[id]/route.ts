import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const { id } = await params;

  const { data, error } = await getSupabaseAdmin()
    .from("sites")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error || !data) return Response.json({ error: "Bulunamadı" }, { status: 404 });
  return Response.json({ site: data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  // Whitelist: only allow toggling is_published via PATCH
  const allowed: Record<string, unknown> = {};
  if (typeof body.is_published === "boolean") allowed.is_published = body.is_published;

  if (Object.keys(allowed).length === 0) {
    return Response.json({ error: "Güncellenecek alan yok." }, { status: 400 });
  }

  const { data, error } = await getSupabaseAdmin()
    .from("sites")
    .update({ ...allowed, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ site: data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const { id } = await params;
  const { business_name, sector, phone, description, html_content } = await request.json();

  const { data, error } = await getSupabaseAdmin()
    .from("sites")
    .update({ business_name, sector, phone, description, html_content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ site: data });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const { id } = await params;

  const { error } = await getSupabaseAdmin()
    .from("sites")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
