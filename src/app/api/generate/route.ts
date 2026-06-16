import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `Sen dünya standartlarında bir web tasarımcısısın. Türk küçük işletmeleri için profesyonel, mobil uyumlu, tek sayfa HTML web sitesi oluşturuyorsun.

KURALLAR:
- Tüm içerik Türkçe olmalı
- Sadece inline CSS kullan, harici dosya bağlama
- Google Fonts CDN'den 1 font import et (Inter veya Poppins)
- Modern, clean, 2025 trendlerine uygun tasarım
- Gradient arka planlar ve soft shadow kullan
- Mobil uyumlu (responsive) olmalı — media query ekle
- Smooth scroll davranışı ekle
- Görseller için placeholder olarak gradient veya emoji kullan

BÖLÜMLER (sırasıyla):
1. HERO: Tam ekran, gradient arka plan, işletme adı büyük font, kısa slogan, CTA butonu (WhatsApp'a yönlendir)
2. HAKKIMIZDA: İşletme hikayesi, 3 öne çıkan özellik (icon olarak emoji kullan)
3. HİZMETLER/MENÜ: Sektöre göre grid kartlar halinde hizmetler veya menü öğeleri (en az 6 tane üret)
4. REFERANSLAR: 3 sahte müşteri yorumu, 5 yıldız, isim ve meslek
5. İLETİŞİM: Telefon, WhatsApp butonu (https://wa.me/90TELEFON), adres placeholder, çalışma saatleri
6. FOOTER: İşletme adı, sosyal medya ikonları (emoji), copyright 2026

RENK PALETİ (sektöre göre):
- Restoran/Kafe: Warm tones (amber, burgundy, cream)
- Berber: Dark tones (charcoal, gold accents)
- Güzellik: Soft tones (rose, lavender, cream)
- Çiçekçi: Fresh tones (green, pink, white)
- Tamirci: Industrial tones (navy, orange, gray)
- Diğer: Professional tones (blue, white, gray)

WhatsApp floating butonu sağ alt köşede sabit dursun (position fixed).
Tüm bölümler arası geçişlerde section padding 80px olsun.
Sadece HTML kodu döndür, başka açıklama yazma.`;

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
