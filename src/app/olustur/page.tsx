"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

export default function OlusturPage() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [sector, setSector] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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

      // 2. Supabase'e kaydet
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

      const saveData = await saveRes.json();

      if (!saveRes.ok) {
        // Kayıt başarısız olsa bile önizlemeye git
        localStorage.setItem("generatedHtml", genData.html);
        router.push("/onizleme");
        return;
      }

      // 3. Panel'e yönlendir
      localStorage.setItem("generatedHtml", genData.html);
      router.push(`/panel`);
    } catch {
      setErrorMsg("Bağlantı hatası. Lütfen tekrar deneyin.");
      setState("error");
    }
  }

  const isLoading = state === "loading";

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
          / İşletmeni Anlat
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
          İşletmeni Anlat
        </h1>
        <p
          style={{
            color: "#78716C",
            marginBottom: "2rem",
            fontSize: "1rem",
          }}
        >
          Birkaç bilgi yeter — AI sitenizi saniyeler içinde hazırlar.
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

          <button
            type="submit"
            disabled={isLoading}
            style={{
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
                AI sitenizi hazırlıyor...
              </>
            ) : (
              "Sitemi Oluştur →"
            )}
          </button>
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
