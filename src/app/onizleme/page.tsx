"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnizlemePage() {
  const router = useRouter();
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("generatedHtml");
    if (!saved) {
      router.replace("/olustur");
      return;
    }
    setHtml(saved);
  }, [router]);

  function handleIndir() {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitem.html";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDuzenle() {
    router.push("/olustur");
  }

  if (!html) {
    return (
      <div
        style={{
          fontFamily: "system-ui, -apple-system, sans-serif",
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
        fontFamily: "system-ui, -apple-system, sans-serif",
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
          gap: "1rem",
          flexShrink: 0,
        }}
      >
        <a
          href="/"
          style={{
            fontWeight: 700,
            fontSize: "1rem",
            color: "#D97706",
            textDecoration: "none",
            marginRight: "auto",
          }}
        >
          Esnaf
        </a>

        <button onClick={handleDuzenle} style={toolbarBtnStyle}>
          ← Düzenle
        </button>

        <button onClick={handleIndir} style={{ ...toolbarBtnStyle, ...primaryBtnStyle }}>
          İndir
        </button>

        <button
          style={{
            ...toolbarBtnStyle,
            background: "#16A34A",
            color: "#fff",
            borderColor: "#16A34A",
          }}
          onClick={() => alert("Yayınlama özelliği yakında aktif olacak!")}
        >
          Yayınla
        </button>
      </div>

      {/* Preview iframe */}
      <iframe
        srcDoc={html}
        title="Site Önizleme"
        sandbox="allow-scripts allow-same-origin"
        style={{
          flex: 1,
          border: "none",
          width: "100%",
        }}
      />
    </div>
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
  fontFamily: "system-ui, -apple-system, sans-serif",
  transition: "background 0.15s",
};

const primaryBtnStyle: React.CSSProperties = {
  background: "#D97706",
  color: "#fff",
  borderColor: "#D97706",
};
