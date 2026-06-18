import { auth } from "@clerk/nextjs/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { Plan } from "@/lib/stripe";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const { data } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("plan, billing_cycle, current_period_end")
    .eq("user_id", userId)
    .single();

  return Response.json({
    plan: (data?.plan ?? "starter") as Plan,
    billing_cycle: data?.billing_cycle ?? "monthly",
    current_period_end: data?.current_period_end ?? null,
  });
}
