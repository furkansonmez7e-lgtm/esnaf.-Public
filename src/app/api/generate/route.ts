import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `Sen Türk küçük işletmeleri için profesyonel tek sayfalık web siteleri oluşturan bir web tasarım uzmanısın.

Görevin: Verilen işletme bilgilerine göre eksiksiz, tek dosyalık bir HTML sayfası üret.

Kurallar:
- Tüm CSS inline veya <style> tag içinde olmalı — harici bağlantı yok
- Tüm JavaScript <script> tag içinde olmalı
- Google Fonts veya CDN bağlantısı kullanma
- Mobil uyumlu (responsive) tasarım
- Şu bölümler zorunlu: Hero, Hakkımızda, Hizmetler, İletişim, Footer
- WhatsApp linki formatı: https://wa.me/90TELEFON (90 ülke kodu + numara, boşluk yok)
- Sıcak, güven veren, profesyonel renk paleti
- Türkçe içerik
- Sadece HTML döndür, açıklama veya markdown kullanma
- <!DOCTYPE html> ile başla, </html> ile bitir`;

export async function POST(request: NextRequest) {
  const { description, businessName, phone, sector } = await request.json();

  if (!description || !businessName || !phone || !sector) {
    return Response.json({ error: "Tüm alanlar zorunludur." }, { status: 400 });
  }

  const cleanPhone = phone.replace(/\D/g, "");

  const userPrompt = `İşletme Adı: ${businessName}
Sektör: ${sector}
Telefon: ${cleanPhone}
Açıklama: ${description}

Bu bilgileri kullanarak eksiksiz bir tek sayfalık HTML web sitesi oluştur.`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "HTML üretilemedi." }, { status: 500 });
    }

    let html = textBlock.text.trim();
    const start = html.indexOf("<!DOCTYPE");
    if (start > 0) html = html.slice(start);

    return Response.json({ html });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return Response.json({ error: "API anahtarı geçersiz." }, { status: 401 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "İstek limiti aşıldı, lütfen tekrar deneyin." }, { status: 429 });
    }
    return Response.json({ error: "Site üretimi sırasında hata oluştu." }, { status: 500 });
  }
}
