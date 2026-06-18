"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Suspense } from "react";

const SEKTORLER = [
  "Restoran",
  "Berber",
  "Güzellik Salonu",
  "Çiçekçi",
  "Tamirci",
  "Kafe",
  "Diğer",
];

type FormState = "idle" | "loading" | "error";

function generateSlug(name: string): string {
  const clean = name
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${clean}-${suffix}`;
}

function OlusturContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { isLoaded, isSignedIn } = useUser();

  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [loadingEdit, setLoadingEdit] = useState(!!editId);

  // Auth guard
  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/giris");
  }, [isLoaded, isSignedIn, router]);

  // Edit modu: mevcut siteyi yükle
  useEffect(() => {
    if (!editId || !isSignedIn) return;
    fetch(`/api/sites/${editId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.site) {
          setBusinessName(d.site.business_name ?? "");
          setPhone(d.site.phone ?? "");
          setSector(d.site.sector ?? "");
          setDescription(d.site.description ?? "");
        } else {
          router.replace("/panel");
        }
      })
      .catch(() => router.replace("/panel"))
      .finally(() => setLoadingEdit(false));
  }, [editId, isSignedIn, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    setErrorMsg("");

    try {
      // 1. AI ile HTML üret
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, phone, sector, description }),
      });

      const genData = await genRes.json();

      if (!genRes.ok || !genData.html) {
        setErrorMsg(genData.error ?? "Bir hata oluştu.");
        setState("error");
        return;
      }

      // 2. Kaydet (yeni veya güncelle)
      if (editId) {
        const res = await fetch(`/api/sites/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_name: businessName,
            sector,
            phone,
            description,
            html_content: genData.html,
          }),
        });
        if (!res.ok) {
          const d = await res.json();
          setErrorMsg(d.error ?? "Kayıt hatası.");
          setState("error");
          return;
        }
        router.push("/panel");
      } else {
        const slug = generateSlug(businessName);
        const saveRes = await fetch("/api/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_name: businessName,
            sector,
            phone,
            description,
            html_content: genData.html,
            slug,
          }),
        });

        if (!saveRes.ok) {
          const d = await saveRes.json();
          setErrorMsg(d.error ?? "Site kaydedilemedi.");
          setState("error");
          return;
        }

        router.push("/panel");
      }
    } catch {
      setErrorMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
      setState("error");
    }
  }

  if (!isLoaded || (isLoaded && !isSignedIn)) return null;
  if (loadingEdit) {
    return (
      <div style={{ fontFamily: "system-ui,sans-serif", background: "#FDFCF9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#78716C" }}>
        Yükleniyor...
      </div>
    );
  }

  const isLoading = state === "loading";
  const isEdit = !!editId;

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#FDFCF9",
        minHeight: "100vh",
      }}
    >
      <nav
        style={{
          padding: "1rem 2rem",
          borderBottom: "1px solid #E7E5E0",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <a
          href="/"
          style={{
            fontWeight: 700,
            fontSize: "1.1rem",
            color: "#D97706",
            textDecoration: "none",
          }}
        >
          Esnaf
        </a>
        <span style={{ color: "#A8A29E", fontSize: "0.9rem" }}>
          / {isEdit ? "Siteyi Düzenle" : "İşletmeni Anlat"}
        </span>
      </nav>

      <main
        style={{
          maxWidth: "560px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(1.6rem, 4vw, 2rem)",
            fontWeight: 800,
            color: "#1C1917",
            marginBottom: "0.5rem",
            lineHeight: 1.2,
          }}
        >
          {isEdit ? "Siteyi Yeniden Üret" : "İşletmeni Anlat"}
        </h1>
        <p
          style={{
            color: "#78716C",
            marginBottom: "2rem",
            fontSize: "1rem",
          }}
        >
          {isEdit
            ? "Bilgileri güncelleyip AI'ın yeni bir site oluşturmasını sağla."
            : "Birkaç bilgi yeter — AI sitenizi saniyeler içinde hazırlar."}
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div>
            <label style={labelStyle}>İşletme Adı</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Örn: Mehmet Usta Tamirevi"
              required
              disabled={isLoading}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05XX XXX XX XX"
              required
              disabled={isLoading}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Sektör</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              required
              disabled={isLoading}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">Seçiniz...</option>
              {SEKTORLER.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>İşletme Hakkında</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Neler sunduğunuzu, özel yönlerinizi ve hedef kitlenizi kısaca anlatın..."
              required
              disabled={isLoading}
              rows={4}
              style={{
                ...inputStyle,
                resize: "vertical",
                minHeight: "100px",
              }}
            />
          </div>

          {state === "error" && (
            <div
              style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                borderRadius: "8px",
                padding: "0.75rem 1rem",
                color: "#DC2626",
                fontSize: "0.9rem",
              }}
            >
              {errorMsg}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            {isEdit && (
              <a
                href="/panel"
                style={{
                  flex: "0 0 auto",
                  background: "#F5F5F4",
                  color: "#44403C",
                  border: "none",
                  borderRadius: "10px",
                  padding: "0.9rem 1.25rem",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                }}
              >
                İptal
              </a>
            )}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                background: isLoading ? "#F5A623" : "#D97706",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "0.9rem 1.5rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "background 0.2s",
              }}
            >
              {isLoading ? (
                <>
                  <span style={spinnerStyle} />
                  AI hazırlıyor... (~20-30 sn)
                </>
              ) : isEdit ? (
                "Yeniden Üret →"
              ) : (
                "Sitemi Oluştur →"
              )}
            </button>
          </div>

          {isLoading && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", padding: "1rem 1.25rem", background: "#FFFBEB", borderRadius: "10px", border: "1px solid #FDE68A" }}>
              <GenerationStep label="İşletme bilgileri analiz ediliyor" activeAfterMs={0} />
              <GenerationStep label="Tasarım ve içerik oluşturuluyor" activeAfterMs={4000} />
              <GenerationStep label="Mobil uyumluluk kontrol ediliyor" activeAfterMs={12000} />
            </div>
          )}
        </form>
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function OlusturPage() {
  return (
    <Suspense
      fallback={
        <div style={{ fontFamily: "system-ui,sans-serif", background: "#FDFCF9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#78716C" }}>
          Yükleniyor...
        </div>
      }
    >
      <OlusturContent />
    </Suspense>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  color: "#44403C",
  marginBottom: "0.4rem",
  fontSize: "0.9rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.7rem 0.9rem",
  borderRadius: "8px",
  border: "1.5px solid #D6D3D1",
  background: "#fff",
  fontSize: "1rem",
  color: "#1C1917",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const spinnerStyle: React.CSSProperties = {
  width: "16px",
  height: "16px",
  border: "2px solid rgba(255,255,255,0.4)",
  borderTopColor: "#fff",
  borderRadius: "50%",
  display: "inline-block",
  animation: "spin 0.7s linear infinite",
};

function GenerationStep({ label, activeAfterMs }: { label: string; activeAfterMs: number }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setActive(true), activeAfterMs);
    return () => clearTimeout(t);
  }, [activeAfterMs]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", opacity: active ? 1 : 0.4, transition: "opacity 0.4s" }}>
      <span style={{ fontSize: "0.75rem" }}>{active ? "✓" : "○"}</span>
      <span style={{ fontSize: "0.82rem", color: "#92400E", fontWeight: active ? 600 : 400 }}>{label}</span>
    </div>
  );
}
