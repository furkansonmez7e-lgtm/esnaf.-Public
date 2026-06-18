import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Panelim — Esnaf",
  description: "Sitelerinizi yönetin, yayınlayın ve düzenleyin.",
};

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
