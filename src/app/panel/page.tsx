"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Site = {
  id: number;
  business_name: string;
  sector: string | null;
  slug: string | null;
  is_published: boolean;
  created_at: string;
};

export default function PanelPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/giris");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/sites")
      .then((r) => r.json())
      .then((d) => setSites(d.sites ?? []))
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  }, [isSignedIn]);

  async function togglePublish(site: Site) {
    setTogglingId(site.id);
    try {
      const res = await fetch(`/api/sites/${site.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !site.is_published }),
      });
      if (res.ok) {
        const { site: updated } = await res.json();
        setSites((prev) =>
          prev.map((s) => (s.id === site.id ? { ...s, ...updated } : s))
        );
      }
    } finally {
      setTogglingId(null);
    }
  }

  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return null;

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  return (
    <div style={{ fontFamily: "system-ui,-apple-system,sans-serif", background: "#FDFCF9", minHeight: "100vh" }}>

      {/* Top bar */}
      <header style={{ background: "#fff", borderBottom: "1.5px solid #E7E5E0", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>

          <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
            <span style={{ width: "28px", height: "28px", background: "#D97706", borderRadius: "7px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: "0.9rem", flexShrink: 0 }}>e</span>
            <span style={{ fontWeight: 700, color: "#1C1917", fontSize: "1.05rem" }}>esnaf</span>
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "#78716C", fontSize: "0.8rem", display: "none", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              className="sm:block">{email}</span>
            <a
              href="/olustur"
              style={{ background: "#D97706", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem", whiteSpace: "nowrap" }}
            >
              + Yeni Site
            </a>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1C1917", margin: 0 }}>Sitelerim</h1>
          {sites.length > 0 && (
            <span style={{ color: "#78716C", fontSize: "0.875rem" }}>{sites.length} site</span>
          )}
        </div>

        {fetchLoading ? (
          <div style={{ textAlign: "center", color: "#78716C", padding: "4rem 0", fontSize: "0.95rem" }}>
            Yükleniyor...
          </div>
        ) : sites.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {sites.map((site) => (
              <SiteCard
                key={site.id}
                site={site}
                toggling={togglingId === site.id}
                onTogglePublish={() => togglePublish(site)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

function LoadingScreen() {
  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: "#FDFCF9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#78716C" }}>
      Yükleniyor...
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ background: "#fff", border: "1.5px dashed #D6D3D1", borderRadius: "16px", padding: "4rem 2rem", textAlign: "center" }}>
      <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌐</div>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1C1917", marginBottom: "0.5rem" }}>
        Henüz bir siteniz yok
      </h2>
      <p style={{ color: "#78716C", fontSize: "0.95rem", marginBottom: "1.5rem", maxWidth: "320px", margin: "0 auto 1.5rem" }}>
        İlk sitenizi oluşturun — sadece birkaç dakika sürer.
      </p>
      <a
        href="/olustur"
        style={{ background: "#D97706", color: "#fff", padding: "0.65rem 1.35rem", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "0.9rem", display: "inline-block" }}
      >
        İlk Sitemi Oluştur →
      </a>
    </div>
  );
}

function SiteCard({
  site,
  toggling,
  onTogglePublish,
}: {
  site: Site;
  toggling: boolean;
  onTogglePublish: () => void;
}) {
  const date = new Date(site.created_at).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      style={{
        background: "#fff",
        border: "1.5px solid #E7E5E0",
        borderRadius: "14px",
        padding: "1.125rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
      }}
    >
      {/* Left: info */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: 0, flex: 1 }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            background: "#FEF3C7",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            flexShrink: 0,
          }}
        >
          🌐
        </div>
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontWeight: 700,
              color: "#1C1917",
              fontSize: "0.975rem",
              margin: "0 0 0.25rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {site.business_name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            {site.sector && (
              <>
                <span style={{ color: "#78716C", fontSize: "0.8rem" }}>{site.sector}</span>
                <span style={{ color: "#D6D3D1", fontSize: "0.8rem" }}>·</span>
              </>
            )}
            <span style={{ color: "#78716C", fontSize: "0.8rem" }}>{date}</span>
            <span
              style={{
                padding: "0.15rem 0.55rem",
                borderRadius: "20px",
                fontSize: "0.75rem",
                fontWeight: 700,
                background: site.is_published ? "#D1FAE5" : "#F5F5F4",
                color: site.is_published ? "#065F46" : "#78716C",
              }}
            >
              {site.is_published ? "Yayında" : "Taslak"}
            </span>
          </div>
          {site.is_published && site.slug && (
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#A8A29E" }}>
              esnaf.co/s/{site.slug}
            </p>
          )}
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", flexShrink: 0 }}>
        <a
          href={`/onizleme?id=${site.id}`}
          style={btnStyle("#F5F5F4", "#44403C")}
        >
          Önizle
        </a>

        <button
          onClick={onTogglePublish}
          disabled={toggling}
          style={{
            ...btnStyle(
              site.is_published ? "#FEF2F2" : "#ECFDF5",
              site.is_published ? "#DC2626" : "#059669"
            ),
            opacity: toggling ? 0.6 : 1,
            cursor: toggling ? "not-allowed" : "pointer",
            border: "none",
          }}
        >
          {toggling ? "…" : site.is_published ? "Yayından Kaldır" : "Yayınla"}
        </button>

        {site.is_published && site.slug && (
          <a
            href={`/s/${site.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={btnStyle("#D97706", "#fff")}
          >
            Siteye Git ↗
          </a>
        )}
      </div>
    </div>
  );
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    padding: "0.45rem 0.9rem",
    borderRadius: "8px",
    background: bg,
    color,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: "0.85rem",
    whiteSpace: "nowrap",
    display: "inline-block",
    fontFamily: "system-ui,sans-serif",
  };
}
