import { SignUp } from "@clerk/nextjs";

export default function KayitPage() {
  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#FDFCF9",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <a
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          textDecoration: "none",
          marginBottom: "1.75rem",
        }}
      >
        <span
          style={{
            width: "28px",
            height: "28px",
            background: "#D97706",
            borderRadius: "7px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: "0.9rem",
          }}
        >
          e
        </span>
        <span style={{ fontWeight: 700, color: "#1C1917", fontSize: "1.1rem" }}>
          esnaf
        </span>
      </a>
      <SignUp />
    </div>
  );
}
