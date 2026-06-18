import { supabase, getSupabaseAdmin } from "@/lib/supabase";

const BASE_URL = "https://esnafdijitalajans.com.tr";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const { data: site } = await supabase
    .from("sites")
    .select("html_content, business_name, sector, phone, description, is_published, user_id, slug")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!site) {
    return new Response(
      `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Site Bulunamadı</title><style>body{margin:0;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#FDFCF9;color:#78716C;flex-direction:column;gap:1rem}a{color:#D97706;font-weight:700}</style></head><body><p>Bu site yayında değil veya bulunamadı.</p><a href="/">esnaf.co'ya dön →</a></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  // Check if user has a paid plan (hide banner for premium)
  let isPremium = false;
  if (site.user_id) {
    const { data: sub } = await getSupabaseAdmin()
      .from("subscriptions")
      .select("plan")
      .eq("user_id", site.user_id)
      .single();
    isPremium = sub?.plan != null && sub.plan !== "starter";
  }

  const title = `${site.business_name}${site.sector ? ` — ${site.sector}` : ""}`;
  const description = site.description ?? `${site.business_name} resmi web sitesi.`;
  const canonicalUrl = `${BASE_URL}/s/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.business_name,
    ...(site.phone ? { telephone: site.phone } : {}),
    url: canonicalUrl,
  };

  const seoTags = `
<meta name="description" content="${escapeAttr(description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${canonicalUrl}">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:type" content="website">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;

  const banner = `
<div style="position:fixed;bottom:0;left:0;right:0;height:32px;background:#1C1917;display:flex;align-items:center;justify-content:center;z-index:9999;font-family:system-ui,-apple-system,sans-serif;">
  <a href="${BASE_URL}" target="_blank" rel="noopener noreferrer" style="color:#D97706;text-decoration:none;font-size:12px;font-weight:600;letter-spacing:0.01em;">
    🚀 Bu site esnaf ile oluşturuldu — esnafdijitalajans.com.tr
  </a>
</div>`;

  let html: string = site.html_content;

  // Inject SEO tags into <head>
  if (html.includes("</head>")) {
    html = html.replace("</head>", `${seoTags}\n</head>`);
  } else {
    html = seoTags + html;
  }

  // Inject banner before </body> (only for free/starter plan)
  if (!isPremium) {
    if (html.includes("</body>")) {
      html = html.replace("</body>", `${banner}\n</body>`);
    } else {
      html = html + banner;
    }
  }

  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
