export type { Plan } from "./plans";
export { PLAN_LIMITS, PLAN_LABELS } from "./plans";

// Stripe client sadece API route'larında kullan (server-side only)
export function getStripe() {
  const { default: Stripe } = require("stripe");
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-05-27.dahlia",
  });
}

// Price ID'leri Stripe Dashboard'dan alıp .env.local'a ekle
export const PRICE_IDS = {
  pro: {
    monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
  },
  business: {
    monthly: process.env.STRIPE_PRICE_BUSINESS_MONTHLY ?? "",
    yearly: process.env.STRIPE_PRICE_BUSINESS_YEARLY ?? "",
  },
  ajans: {
    monthly: process.env.STRIPE_PRICE_AJANS_MONTHLY ?? "",
    yearly: process.env.STRIPE_PRICE_AJANS_YEARLY ?? "",
  },
} as const;
