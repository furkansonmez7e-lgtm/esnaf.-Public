"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PanelPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/giris");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
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

  if (!isSignedIn) return null;

  const email = user.emailAddresses[0]?.emailAddress ?? "";

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#FDFCF9",
        minHeight: "100vh",
      }}
    >
      {/* Top bar */}
      <header
        style={{
          background: "#fff",
          borderBottom: "1.5px solid #E7E5E0",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            padding: "0 1.5rem",
            height: "60px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                width: "26px",
                height: "26px",
                background: "#D97706",
                borderRadius: "6px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 900,
                fontSize: "0.85rem",
              }}
            >
              e
            </span>
            <span style={{ fontWeight: 700, color: "#1C1917", fontSize: "1.05rem" }}>
              esnaf
            </span>
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ color: "#78716C", fontSize: "0.875rem" }}>{email}</span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main
        style={{ maxWidth: "900px", margin: "0 auto", padding: "3rem 1.5rem" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#1C1917",
              margin: 0,
            }}
          >
            Sitelerim
          </h1>
          <a
            href="/olustur"
            style={{
              background: "#D97706",
              color: "#fff",
              padding: "0.65rem 1.25rem",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
            }}
          >
            + Yeni Site Oluştur →
          </a>
        </div>

        {/* Empty state */}
        <div
          style={{
            background: "#fff",
            border: "1.5px dashed #D6D3D1",
            borderRadius: "16px",
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🌐</div>
          <h2
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "#1C1917",
              marginBottom: "0.5rem",
            }}
          >
            Henüz bir siteniz yok
          </h2>
          <p
            style={{
              color: "#78716C",
              fontSize: "0.95rem",
              marginBottom: "1.5rem",
            }}
          >
            İlk sitenizi oluşturun — sadece birkaç dakika sürer.
          </p>
          <a
            href="/olustur"
            style={{
              background: "#D97706",
              color: "#fff",
              padding: "0.65rem 1.25rem",
              borderRadius: "10px",
              textDecoration: "none",
              fontWeight: 700,
              fontSize: "0.9rem",
              display: "inline-block",
            }}
          >
            İlk Sitemi Oluştur →
          </a>
        </div>
      </main>
    </div>
  );
}
