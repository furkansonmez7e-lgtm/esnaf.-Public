import { NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) return new Response("Signature eksik", { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Webhook doğrulama hatası", { status: 400 });
  }

  const db = getSupabaseAdmin();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.mode !== "subscription") return new Response("ok");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string) as any;
    const userId = subscription.metadata.clerk_user_id;
    const plan = subscription.metadata.plan;
    const cycle = subscription.metadata.cycle;
    const periodEnd = subscription.current_period_end ?? subscription.billing_cycle_anchor;

    await db.from("subscriptions").upsert({
      user_id: userId,
      plan,
      billing_cycle: cycle,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscription.id,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    });
  }

  if (event.type === "customer.subscription.updated") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = event.data.object as any;
    const userId = subscription.metadata.clerk_user_id;
    if (!userId) return new Response("ok");

    const plan = subscription.metadata.plan;
    const cycle = subscription.metadata.cycle;
    const status = subscription.status;
    const periodEnd = subscription.current_period_end ?? subscription.billing_cycle_anchor;

    await db.from("subscriptions").upsert({
      user_id: userId,
      plan: status === "active" ? plan : "starter",
      billing_cycle: cycle ?? "monthly",
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    });
  }

  if (event.type === "customer.subscription.deleted") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscription = event.data.object as any;
    const userId = subscription.metadata.clerk_user_id;
    if (!userId) return new Response("ok");

    await db.from("subscriptions")
      .update({ plan: "starter", stripe_subscription_id: null, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
  }

  return new Response("ok");
}
