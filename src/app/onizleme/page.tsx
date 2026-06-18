"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OnizlemeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siteId = searchParams.get("id");

  const [html, setHtml] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("sitem");
  const [isPublished, setIsPublished] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (siteId) {
      fetch(`/api/sites/${siteId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.site?.html_content) {
            setHtml(d.site.html_content);
            setSiteName(d.site.business_name ?? "sitem");
            setIsPublished(d.site.is_published ?? false);
            setSlug(d.site.slug ?? null);
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

  async function handleTogglePublish() {
    if (!siteId) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !isPublished }),
      });
      if (res.ok) {
        const { site } = await res.json();
        setIsPublished(site.is_published);
      }
    } finally {
      setPublishing(false);
    }
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
          flexWrap: "wrap",
        }}
      >
        <a
          href={siteId ? "/panel" : "/"}
          style={{ fontWeight: 700, fontSize: "1rem", color: "#D97706", textDecoration: "none", marginRight: "auto" }}
        >
          ← {siteId ? "Panele Dön" : "Ana Sayfa"}
        </a>

        {siteId && (
          <a
            href={`/olustur?edit=${siteId}`}
            style={toolbarBtnStyle}
          >
            Düzenle
          </a>
        )}

        <button onClick={handleIndir} style={{ ...toolbarBtnStyle, cursor: "pointer" }}>
          İndir
        </button>

        {siteId && (
          <button
            onClick={handleTogglePublish}
            disabled={publishing}
            style={{
              ...toolbarBtnStyle,
              background: isPublished ? "#7f1d1d" : "#D97706",
              borderColor: isPublished ? "#7f1d1d" : "#D97706",
              color: "#fff",
              cursor: publishing ? "not-allowed" : "pointer",
              opacity: publishing ? 0.7 : 1,
            }}
          >
            {publishing ? "..." : isPublished ? "Yayından Kaldır" : "Yayınla"}
          </button>
        )}

        {isPublished && slug && (
          <a
            href={`/s/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...toolbarBtnStyle, background: "#D97706", borderColor: "#D97706", color: "#fff" }}
          >
            Siteye Git ↗
          </a>
        )}
      </div>

      {/* Published notice */}
      {isPublished && slug && (
        <div style={{ background: "#065F46", padding: "0.5rem 1.5rem", fontSize: "0.8rem", color: "#D1FAE5", fontWeight: 600 }}>
          Yayında: esnaf.co/s/{slug}
        </div>
      )}

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
