export type Plan = "starter" | "pro" | "business" | "ajans";

export const PLAN_LIMITS: Record<Plan, number> = {
  starter: 1,
  pro: 5,
  business: 15,
  ajans: Infinity,
};

export const PLAN_LABELS: Record<Plan, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
  ajans: "Ajans",
};
