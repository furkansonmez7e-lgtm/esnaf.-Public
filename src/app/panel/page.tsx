"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { PLAN_LABELS, PLAN_LIMITS, type Plan } from "@/lib/stripe";



type Site = {
  id: number;
  business_name: string;
  sector: string | null;
  slug: string | null;
  is_published: boolean;
  created_at: string;
};

function PanelContent() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const upgraded = searchParams.get("upgraded") === "true";

  const [sites, setSites] = useState<Site[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [plan, setPlan] = useState<Plan>("starter");
  const [portalLoading, setPortalLoading] = useState(false);
  const [showUpgradedBanner, setShowUpgradedBanner] = useState(upgraded);
  const [showGoogleCard, setShowGoogleCard] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("esnaf_google_card_dismissed");
    if (!dismissed) setShowGoogleCard(true);
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace("/giris");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/sites")
      .then((r) => r.json())
      .then((d) => {
        if (d.sites) setSites(d.sites);
        else setFetchError(true);
      })
      .catch(() => setFetchError(true))
      .finally(() => setFetchLoading(false));

    fetch("/api/subscription")
      .then((r) => r.json())
      .then((d) => setPlan(d.plan ?? "starter"))
      .catch(() => {});
  }, [isSignedIn]);

  function dismissGoogleCard() {
    localStorage.setItem("esnaf_google_card_dismissed", "1");
    setShowGoogleCard(false);
  }

  async function openPortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  const siteLimit = PLAN_LIMITS[plan];
  const atLimit = sites.length >= siteLimit;

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

  async function deleteSite(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/sites/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSites((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
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
            {/* Plan badge */}
            <span style={{ padding: "0.2rem 0.6rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, background: plan === "starter" ? "#F5F5F4" : "#FEF3C7", color: plan === "starter" ? "#78716C" : "#92400E" }}>
              {PLAN_LABELS[plan]}
            </span>
            {atLimit ? (
              <a
                href="/#fiyatlar"
                style={{ background: "#D97706", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem", whiteSpace: "nowrap" }}
              >
                Plan Yükselt
              </a>
            ) : (
              <a
                href="/olustur"
                style={{ background: "#D97706", color: "#fff", padding: "0.5rem 1rem", borderRadius: "8px", textDecoration: "none", fontWeight: 700, fontSize: "0.875rem", whiteSpace: "nowrap" }}
              >
                + Yeni Site
              </a>
            )}
            <UserButton />
          </div>
        </div>
      </header>

      {/* Upgraded banner */}
      {showUpgradedBanner && (
        <div style={{ background: "#D1FAE5", borderBottom: "1.5px solid #6EE7B7", padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
          <span style={{ color: "#065F46", fontWeight: 600, fontSize: "0.9rem" }}>
            Planın başarıyla güncellendi! Yeni özellikler aktif.
          </span>
          <button onClick={() => setShowUpgradedBanner(false)} style={{ background: "none", border: "none", color: "#065F46", cursor: "pointer", fontSize: "1rem", fontWeight: 700 }}>
            ×
          </button>
        </div>
      )}

      {/* Main */}
      <main style={{ maxWidth: "960px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#1C1917", margin: "0 0 0.25rem" }}>Sitelerim</h1>
            <p style={{ color: "#78716C", fontSize: "0.85rem", margin: 0 }}>
              {sites.length} / {siteLimit === Infinity ? "∞" : siteLimit} site kullanılıyor
            </p>
          </div>
          {plan !== "starter" && (
            <button
              onClick={openPortal}
              disabled={portalLoading}
              style={{ background: "none", border: "1.5px solid #E7E5E0", borderRadius: "8px", padding: "0.4rem 0.85rem", color: "#78716C", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
            >
              {portalLoading ? "..." : "Aboneliği Yönet"}
            </button>
          )}
        </div>

        {fetchLoading ? (
          <SiteSkeleton />
        ) : fetchError ? (
          <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: "14px", padding: "2rem", textAlign: "center" }}>
            <p style={{ color: "#DC2626", fontWeight: 600, marginBottom: "0.75rem" }}>Siteler yüklenemedi.</p>
            <button
              onClick={() => { setFetchError(false); setFetchLoading(true); fetch("/api/sites").then(r => r.json()).then(d => setSites(d.sites ?? [])).catch(() => setFetchError(true)).finally(() => setFetchLoading(false)); }}
              style={{ background: "#D97706", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 1.25rem", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}
            >
              Tekrar Dene
            </button>
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
                deleting={deletingId === site.id}
                onTogglePublish={() => togglePublish(site)}
                onDeleteRequest={() => setConfirmDeleteId(site.id)}
              />
            ))}
            {showGoogleCard && sites.some((s) => s.is_published) && (
              <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: "14px", padding: "1.125rem 1.5rem", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start", minWidth: 0 }}>
                  <span style={{ fontSize: "1.4rem", flexShrink: 0, marginTop: "0.1rem" }}>🔍</span>
                  <div>
                    <p style={{ fontWeight: 700, color: "#1E40AF", fontSize: "0.9rem", margin: "0 0 0.35rem" }}>
                      Sitenizi Google&apos;a Gönderin
                    </p>
                    <p style={{ color: "#3B82F6", fontSize: "0.8rem", margin: "0 0 0.5rem", lineHeight: 1.55 }}>
                      Siteniz Google&apos;da görünmesi için:{" "}
                      <strong>1)</strong> Google Search Console&apos;a gidin{" "}
                      <strong>2)</strong> URL&apos;nizi yapıştırın{" "}
                      <strong>3)</strong> &quot;Dizine eklenmesini iste&quot; tıklayın.
                    </p>
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#1D4ED8", fontSize: "0.8rem", fontWeight: 700, textDecoration: "underline" }}
                    >
                      Google Search Console&apos;u Aç ↗
                    </a>
                  </div>
                </div>
                <button
                  onClick={dismissGoogleCard}
                  style={{ background: "none", border: "none", color: "#93C5FD", cursor: "pointer", fontSize: "1.1rem", fontWeight: 700, flexShrink: 0, padding: "0", lineHeight: 1 }}
                  aria-label="Kapat"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete confirm overlay */}
      {confirmDeleteId !== null && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem",
          }}
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            style={{ background: "#fff", borderRadius: "16px", padding: "2rem", maxWidth: "380px", width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1C1917", marginBottom: "0.5rem" }}>
              Siteyi sil?
            </h2>
            <p style={{ color: "#78716C", fontSize: "0.9rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
              Bu işlem geri alınamaz. Yayındaki site de kaldırılır.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                style={{ flex: 1, padding: "0.65rem", borderRadius: "8px", border: "1.5px solid #E7E5E0", background: "#fff", color: "#44403C", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
              >
                Vazgeç
              </button>
              <button
                onClick={() => confirmDeleteId !== null && deleteSite(confirmDeleteId)}
                disabled={deletingId !== null}
                style={{ flex: 1, padding: "0.65rem", borderRadius: "8px", border: "none", background: "#DC2626", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", opacity: deletingId !== null ? 0.6 : 1 }}
              >
                {deletingId !== null ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────────── */

export default function PanelPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PanelContent />
    </Suspense>
  );
}

function LoadingScreen() {
  return (
    <div style={{ fontFamily: "system-ui,sans-serif", background: "#FDFCF9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#78716C" }}>
      Yükleniyor...
    </div>
  );
}

function SiteSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ background: "#fff", border: "1.5px solid #E7E5E0", borderRadius: "14px", padding: "1.125rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "44px", height: "44px", background: "#F5F5F4", borderRadius: "10px", flexShrink: 0, animation: "pulse 1.5s ease-in-out infinite" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <div style={{ height: "14px", background: "#F5F5F4", borderRadius: "6px", width: `${50 + i * 15}%`, animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: "12px", background: "#F5F5F4", borderRadius: "6px", width: "40%", animation: "pulse 1.5s ease-in-out infinite" }} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[80, 70, 90].map((w, j) => (
              <div key={j} style={{ height: "32px", width: `${w}px`, background: "#F5F5F4", borderRadius: "8px", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        </div>
      ))}
      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
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
  deleting,
  onTogglePublish,
  onDeleteRequest,
}: {
  site: Site;
  toggling: boolean;
  deleting: boolean;
  onTogglePublish: () => void;
  onDeleteRequest: () => void;
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

        <a
          href={`/olustur?edit=${site.id}`}
          style={btnStyle("#EFF6FF", "#1D4ED8")}
        >
          Düzenle
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

        <button
          onClick={onDeleteRequest}
          disabled={deleting}
          style={{
            ...btnStyle("#FEF2F2", "#DC2626"),
            opacity: deleting ? 0.6 : 1,
            cursor: deleting ? "not-allowed" : "pointer",
            border: "none",
          }}
        >
          {deleting ? "…" : "Sil"}
        </button>
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
