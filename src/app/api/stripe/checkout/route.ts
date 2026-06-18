import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { getStripe, PRICE_IDS } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const { plan, cycle } = await request.json() as {
    plan: "pro" | "business" | "ajans";
    cycle: "monthly" | "yearly";
  };

  const priceId = PRICE_IDS[plan]?.[cycle];
  if (!priceId) {
    return Response.json({ error: "Geçersiz plan veya dönem." }, { status: 400 });
  }

  const stripe = getStripe();

  const { data: sub } = await getSupabaseAdmin()
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  let customerId = sub?.stripe_customer_id as string | undefined;

  if (!customerId) {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    const customer = await stripe.customers.create({
      email,
      metadata: { clerk_user_id: userId },
    });
    customerId = customer.id;
  }

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/panel?upgraded=true`,
    cancel_url: `${origin}/#fiyatlar`,
    subscription_data: {
      trial_period_days: 30,
      metadata: { clerk_user_id: userId, plan, cycle },
    },
    locale: "tr",
    currency: "try",
  });

  return Response.json({ url: session.url });
}
