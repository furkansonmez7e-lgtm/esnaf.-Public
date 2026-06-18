import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { PLAN_LIMITS, type Plan } from "@/lib/stripe";
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

  const db = getSupabaseAdmin();

  // Plan limit kontrolü
  const { data: sub } = await db
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .single();

  const plan = ((sub?.plan as Plan) ?? "starter");
  const limit = PLAN_LIMITS[plan];

  const { count } = await db
    .from("sites")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (limit !== Infinity && (count ?? 0) >= limit) {
    return Response.json(
      { error: `${plan.charAt(0).toUpperCase() + plan.slice(1)} planında en fazla ${limit} site oluşturabilirsiniz. Planınızı yükseltin.` },
      { status: 403 }
    );
  }

  const { business_name, sector, phone, description, html_content, slug } =
    await request.json();

  const { data, error } = await db
    .from("sites")
    .insert({ user_id: userId, business_name, sector, phone, description, html_content, slug })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ site: data }, { status: 201 });
}
