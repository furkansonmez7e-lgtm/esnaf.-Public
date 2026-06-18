import { supabase } from "@/lib/supabase";

export async function GET() {
  const { count, error } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  if (error) {
    return Response.json({ count: 0 });
  }

  return Response.json({ count: count ?? 0 });
}
