import { supabase } from "@/lib/supabase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: site } = await supabase
    .from("sites")
    .select("html_content, business_name, is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!site) {
    return new Response(
      `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Site Bulunamadı</title><style>body{margin:0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#FDFCF9;color:#78716C;flex-direction:column;gap:1rem}a{color:#D97706;font-weight:700}</style></head><body><p>Bu site yayında değil veya bulunamadı.</p><a href="/">esnaf.co'ya dön →</a></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  return new Response(site.html_content, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
