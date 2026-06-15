"use client";

import { useState, useEffect } from "react";

/* ─── Data ─────────────────────────────────────────────────────────────── */

const TYPEWRITER_TEXTS = [
  "Kadıköy'de 12 yıllık berberim...",
  "Beşiktaş'ta deniz ürünleri restoranımız var...",
  "Bakırköy'de çiçekçi dükkanım var...",
];

const HOW_IT_WORKS = [
  {
    num: "01",
    title: "İşletmeni anlat",
    desc: "Dükkan adını, nerede olduğunu ve ne yaptığını birkaç cümleyle yaz.",
  },
  {
    num: "02",
    title: "AI sitenle ilgilensin",
    desc: "Yapay zeka saniyeler içinde web siteni, menünü ve içeriklerini oluşturur.",
  },
  {
    num: "03",
    title: "Tüm kanallara yayılır",
    desc: "WhatsApp, Google, Instagram — hepsi otomatik olarak senkronize olur.",
  },
];

const FEATURES = [
  { icon: "🌐", title: "AI Web Sitesi", desc: "Dakikalar içinde profesyonel, mobil uyumlu web siteni oluştur." },
  { icon: "💬", title: "WhatsApp Entegrasyonu", desc: "Müşteri mesajlarını otomatik yanıtla, randevu ve sipariş al." },
  { icon: "📍", title: "Google Profili", desc: "Google Haritalar'da öne çık, yorum ve konumunu yönet." },
  { icon: "📱", title: "QR Kod Menü", desc: "Güncel menünü QR ile masaya taşı, tek tıkla güncelle." },
  { icon: "📸", title: "Instagram İçerik", desc: "AI destekli paylaşım önerileri ve otomatik içerik üretimi." },
  { icon: "📊", title: "Analitik", desc: "Kaç kişi baktı, kaçı aradı — hepsini tek ekranda takip et." },
];

const BEFORE_LIST = [
  "Web sitesi yok ya da çok eski",
  "WhatsApp'a tek tek cevap veriyorsun",
  "Google'da görünmüyorsun",
  "Menü kâğıda yazılı, güncelleme zor",
  "Instagram için vakit yok",
  "Rakipler seni geçiyor",
];

const AFTER_LIST = [
  "7/24 çalışan AI destekli web sitesi",
  "Otomatik WhatsApp cevapları",
  "Google'da ilk sıralarda",
  "QR menü, tek tıkla güncelleme",
  "AI haftalık içerik planı",
  "Sektörünün dijital lideri ol",
];

const PRICING = [
  {
    name: "Ücretsiz",
    price: "₺0",
    period: "/ay",
    desc: "Başlamak için ideal",
    features: [
      "1 sayfalık web sitesi",
      "Temel WhatsApp entegrasyonu",
      "Google Profil bağlantısı",
      "QR Menü (5 ürün)",
    ],
    cta: "Ücretsiz Başla",
    highlight: false,
  },
  {
    name: "Pro",
    price: "₺499",
    period: "/ay",
    desc: "Büyüyen işletmeler için",
    features: [
      "Çok sayfalı AI web sitesi",
      "Gelişmiş WhatsApp botu",
      "Google Profil yönetimi",
      "QR Menü (sınırsız)",
      "Instagram içerik planı",
      "Temel analitik",
    ],
    cta: "Pro'ya Geç →",
    highlight: true,
  },
  {
    name: "Business",
    price: "₺999",
    period: "/ay",
    desc: "Güçlü işletmeler için",
    features: [
      "Pro'daki her şey",
      "Çoklu şube desteği",
      "Gelişmiş analitik",
      "Öncelikli destek",
      "Özel entegrasyonlar",
      "Aylık performans raporu",
    ],
    cta: "Business Başla",
    highlight: false,
  },
  {
    name: "Ajans",
    price: "₺2.499",
    period: "/ay",
    desc: "Ajanslar ve zincirler için",
    features: [
      "Business'taki her şey",
      "Sınırsız müşteri hesabı",
      "White-label panel",
      "API erişimi",
      "Özel geliştirme saatleri",
      "Adanmış hesap yöneticisi",
    ],
    cta: "Ajans Planı Al",
    highlight: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Mehmet Usta",
    role: "Berber · Kadıköy",
    text: "Dükkanımı anlattım, 5 dakikada sitem hazırdı. Artık Google'dan müşteri geliyor, inanılmaz.",
    avatar: "M",
  },
  {
    name: "Selin Hanım",
    role: "Restoran Sahibi · Beşiktaş",
    text: "WhatsApp'ta tek tek cevap vermekten bunalmıştım. Esnaf her şeyi hallediyor, ben sadece mutfakla ilgileniyorum.",
    avatar: "S",
  },
  {
    name: "Ahmet Bey",
    role: "Çiçekçi · Bakırköy",
    text: "QR menüm sayesinde müşteriler fiyatları kendisi görüyor. Telefonla fiyat sormak tamamen bitti.",
    avatar: "A",
  },
];

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [email1, setEmail1] = useState("");
  const [sent1, setSent1] = useState(false);
  const [email2, setEmail2] = useState("");
  const [sent2, setSent2] = useState(false);

  // Typewriter
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const current = TYPEWRITER_TEXTS[textIndex];
    const delay = isDeleting ? 38 : charIndex === current.length ? 1800 : 62;

    const t = setTimeout(() => {
      if (!isDeleting && charIndex < current.length) {
        setDisplayed(current.slice(0, charIndex + 1));
        setCharIndex((c) => c + 1);
      } else if (!isDeleting && charIndex === current.length) {
        setIsDeleting(true);
      } else if (isDeleting && charIndex > 0) {
        setDisplayed(current.slice(0, charIndex - 1));
        setCharIndex((c) => c - 1);
      } else {
        setIsDeleting(false);
        setTextIndex((i) => (i + 1) % TYPEWRITER_TEXTS.length);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [charIndex, isDeleting, textIndex]);

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", background: "#FDFCF9", color: "#1c1917" }}>

      {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
      <nav
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#FDFCF9]/90 backdrop-blur-md border-b border-stone-200 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-5 h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#D97706" }}
            >
              <span className="text-white font-black text-base leading-none">e</span>
            </div>
            <span className="font-bold text-stone-900 text-lg tracking-tight">esnaf</span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md uppercase tracking-widest">
              BETA
            </span>
          </a>

          {/* Links */}
          <div className="hidden sm:flex items-center gap-7 text-sm font-medium text-stone-500">
            <a href="#nasil-calisir" className="hover:text-amber-700 transition-colors">
              Nasıl çalışır?
            </a>
            <a href="#fiyatlar" className="hover:text-amber-700 transition-colors">
              Fiyatlar
            </a>
          </div>

          {/* CTA */}
          <a
            href="#cta"
            className="rounded-lg text-white text-sm font-semibold px-4 py-2 transition-colors"
            style={{ background: "#D97706" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#b45309")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#D97706")}
          >
            Erken Erişim →
          </a>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-5 pt-36 pb-20 flex flex-col items-center text-center">
        <span className="inline-block rounded-full bg-amber-100 text-amber-700 text-xs font-bold px-4 py-1.5 uppercase tracking-widest mb-7">
          Yakında
        </span>
        <h1 className="text-4xl sm:text-6xl font-black text-stone-900 leading-tight mb-5 max-w-2xl">
          İşletmeni anlat.{" "}
          <span style={{ color: "#D97706" }}>AI sitenle baş etsin.</span>
        </h1>
        <p className="text-lg text-stone-500 max-w-xl leading-relaxed mb-10">
          Dakikalar içinde AI destekli web siteni kur. WhatsApp ile müşterilerini
          karşıla, QR menünü hazırla — teknik bilgi gerekmez.
        </p>

        {/* Terminal typewriter */}
        <div className="w-full max-w-lg bg-stone-900 rounded-2xl overflow-hidden shadow-2xl mb-10 text-left">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-stone-800">
            <div className="w-3 h-3 rounded-full bg-red-500 opacity-90" />
            <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-90" />
            <div className="w-3 h-3 rounded-full bg-green-500 opacity-90" />
            <span className="ml-3 text-stone-500 text-xs font-mono">esnaf — işletmeni anlat</span>
          </div>
          <div className="px-5 py-4 h-14 flex items-center font-mono text-sm">
            <span className="text-green-400 mr-2">{">"}</span>
            <span className="text-stone-100">{displayed}</span>
            <span className="inline-block w-0.5 h-4 bg-amber-400 ml-0.5 align-middle animate-pulse" />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-0 text-sm mb-10">
          {["5 dk kurulum", "₺499/ay", "%100 Türkçe"].map((stat, i) => (
            <span key={stat} className="flex items-center gap-2">
              {i > 0 && <span className="w-1 h-1 rounded-full bg-stone-300 hidden sm:inline-block" />}
              <span className="font-semibold text-stone-700 px-2">{stat}</span>
            </span>
          ))}
        </div>

        {/* Email form */}
        {sent1 ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-8 py-5 text-amber-800 font-semibold text-base">
            Harika! Seni ilk öğrenenler arasına aldık 🎉
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); if (email1) setSent1(true); }}
            className="flex w-full max-w-md flex-col sm:flex-row gap-3"
          >
            <input
              type="email"
              required
              placeholder="E-posta adresin"
              value={email1}
              onChange={(e) => setEmail1(e.target.value)}
              className="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              className="rounded-xl px-6 py-3 font-bold text-white shadow-sm transition-colors whitespace-nowrap"
              style={{ background: "#D97706" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#b45309")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#D97706")}
            >
              Erken Erişim Al
            </button>
          </form>
        )}
      </section>

      {/* ── NASIL ÇALIŞIR ───────────────────────────────────────────────── */}
      <section id="nasil-calisir" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4">Nasıl çalışır?</h2>
          <p className="text-stone-500 max-w-sm mx-auto">
            Üç adımda dijital varlığını kur, geri kalanını AI halleder.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl bg-white border border-stone-100 shadow-sm p-8 hover:shadow-md transition-shadow"
            >
              <span className="block text-7xl font-black text-amber-100 leading-none mb-5 select-none">
                {step.num}
              </span>
              <h3 className="text-xl font-bold text-stone-900 mb-2">{step.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── ÖZELLİKLER ─────────────────────────────────────────────────── */}
      <section id="ozellikler" className="bg-stone-50/80 py-20 border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4">Tek platformda her şey</h2>
            <p className="text-stone-500 max-w-sm mx-auto">
              Müşteri çekmek için ihtiyacın olan her araç burada.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl bg-white border border-stone-100 shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="text-base font-bold text-stone-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÖNCE / SONRA ────────────────────────────────────────────────── */}
      <section className="bg-stone-900 py-20">
        <div className="max-w-4xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">Farkı gör</h2>
            <p className="text-stone-400 max-w-sm mx-auto">
              Esnaf olmadan ve Esnaf ile dijitalde esnaf olmak.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Before */}
            <div className="rounded-2xl bg-stone-800 border border-stone-700 p-8">
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <h3 className="text-white font-bold">Şu an</h3>
              </div>
              <ul className="space-y-3.5">
                {BEFORE_LIST.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-stone-400 text-sm">
                    <span className="text-red-400 mt-0.5 shrink-0">✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* After */}
            <div
              className="rounded-2xl border p-8"
              style={{ background: "rgba(120,53,15,0.3)", borderColor: "rgba(180,83,9,0.3)" }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                <h3 className="text-white font-bold">Esnaf ile</h3>
              </div>
              <ul className="space-y-3.5">
                {AFTER_LIST.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-stone-300 text-sm">
                    <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FİYATLAR ────────────────────────────────────────────────────── */}
      <section id="fiyatlar" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4">Sana uygun plan</h2>
          <p className="text-stone-500 max-w-sm mx-auto">
            İstediğin zaman yükselt ya da düşür. Gizli ücret yok.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {PRICING.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col transition-all ${
                plan.highlight
                  ? "text-white shadow-xl shadow-amber-200/60 ring-2 ring-amber-500 lg:-mt-3 lg:-mb-3"
                  : "bg-white border border-stone-100 shadow-sm text-stone-900"
              }`}
              style={plan.highlight ? { background: "#D97706" } : {}}
            >
              <div className="mb-5">
                <p
                  className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                    plan.highlight ? "text-amber-200" : "text-stone-400"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-3xl font-black ${plan.highlight ? "text-white" : "text-stone-900"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.highlight ? "text-amber-200" : "text-stone-400"}`}>
                    {plan.period}
                  </span>
                </div>
                <p className={`text-xs ${plan.highlight ? "text-amber-200" : "text-stone-400"}`}>
                  {plan.desc}
                </p>
              </div>

              <ul className="flex-1 space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2 text-sm ${
                      plan.highlight ? "text-amber-100" : "text-stone-600"
                    }`}
                  >
                    <span className={`shrink-0 ${plan.highlight ? "text-amber-200" : "text-amber-600"}`}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full rounded-xl py-2.5 text-sm font-bold transition-colors ${
                  plan.highlight
                    ? "bg-white text-amber-700 hover:bg-amber-50"
                    : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-100"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── REFERANSLAR ─────────────────────────────────────────────────── */}
      <section id="referanslar" className="bg-stone-50/80 py-20 border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2">Esnaflar ne diyor?</h2>
            <p className="text-stone-500 text-sm">Gerçek işletmeciler, gerçek sonuçlar.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl bg-white border border-stone-100 shadow-sm p-7 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-lg">★</span>
                  ))}
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm shrink-0"
                    style={{ background: "#fef3c7" }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">{t.name}</p>
                    <p className="text-xs text-stone-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SON CTA ─────────────────────────────────────────────────────── */}
      <section id="cta" style={{ background: "#D97706" }} className="py-24">
        <div className="max-w-2xl mx-auto px-5 flex flex-col items-center text-center">
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Dijitale geçmeyi erteleme.
          </h2>
          <p className="text-amber-100 mb-10 max-w-md leading-relaxed">
            Her gün ertelediğin bir müşteri rakibine gidiyor. Şimdi başla, ilk 30 gün ücretsiz.
          </p>
          {sent2 ? (
            <div className="rounded-2xl bg-white/20 backdrop-blur px-8 py-5 text-white font-semibold text-base">
              Harika! Seni ilk öğrenenler arasına aldık 🎉
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); if (email2) setSent2(true); }}
              className="flex w-full max-w-md flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                placeholder="E-posta adresin"
                value={email2}
                onChange={(e) => setEmail2(e.target.value)}
                className="flex-1 rounded-xl border-0 px-4 py-3 text-stone-900 placeholder-stone-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                type="submit"
                className="rounded-xl bg-stone-900 hover:bg-stone-800 px-6 py-3 font-bold text-white shadow-sm transition-colors whitespace-nowrap"
              >
                Ücretsiz Başla →
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-stone-900 py-8">
        <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: "#D97706" }}
            >
              <span className="text-white font-black text-sm leading-none">e</span>
            </div>
            <span className="font-bold text-white">esnaf</span>
          </div>
          <p className="text-stone-500 text-sm text-center">
            © 2026 Esnaf Dijital Ajans · esnafdijitalajans.com.tr
          </p>
        </div>
      </footer>
    </div>
  );
}
