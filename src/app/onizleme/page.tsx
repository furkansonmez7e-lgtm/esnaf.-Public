"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OnizlemeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("id");

  const [html, setHtml] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("sitem");

  useEffect(() => {
    if (siteId) {
      fetch(`/api/sites/${siteId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.site?.html_content) {
            setHtml(d.site.html_content);
            setSiteName(d.site.business_name ?? "sitem");
          } else {
            router.replace("/panel");
          }
        })
        .catch(() => router.replace("/panel"));
    } else {
      const saved = localStorage.getItem("generatedHtml");
      if (!saved) {
        router.replace("/olustur");
        return;
      }
      setHtml(saved);
    }
  }, [siteId, router]);

  function handleIndir() {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${siteName.replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!html) {
    return (
      <div
        style={{
          fontFamily: "system-ui,sans-serif",
          background: "#FDFCF9",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#78716C",
        }}
      >
        Yükleniyor...
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "system-ui,sans-serif",
        background: "#1C1917",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          background: "#292524",
          padding: "0.75rem 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          flexShrink: 0,
        }}
      >
        <a
          href={siteId ? "/panel" : "/"}
          style={{ fontWeight: 700, fontSize: "1rem", color: "#D97706", textDecoration: "none", marginRight: "auto" }}
        >
          Esnaf
        </a>

        <a
          href={siteId ? "/panel" : "/olustur"}
          style={toolbarBtnStyle}
        >
          ← {siteId ? "Panele Dön" : "Düzenle"}
        </a>

        <button onClick={handleIndir} style={{ ...toolbarBtnStyle, background: "#D97706", color: "#fff", borderColor: "#D97706", cursor: "pointer" }}>
          İndir
        </button>
      </div>

      {/* Preview iframe */}
      <iframe
        srcDoc={html}
        title="Site Önizleme"
        sandbox="allow-scripts allow-same-origin"
        style={{ flex: 1, border: "none", width: "100%" }}
      />
    </div>
  );
}

export default function OnizlemePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            fontFamily: "system-ui,sans-serif",
            background: "#FDFCF9",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#78716C",
          }}
        >
          Yükleniyor...
        </div>
      }
    >
      <OnizlemeContent />
    </Suspense>
  );
}

const toolbarBtnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "7px",
  border: "1.5px solid #57534E",
  background: "transparent",
  color: "#E7E5E0",
  fontSize: "0.875rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "system-ui,sans-serif",
  textDecoration: "none",
  display: "inline-block",
};
