import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const { data } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (!data?.stripe_customer_id) {
    return Response.json({ error: "Abonelik bulunamadı." }, { status: 404 });
  }

  const stripe = getStripe();
  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${origin}/panel`,
  });

  return Response.json({ url: session.url });
}
