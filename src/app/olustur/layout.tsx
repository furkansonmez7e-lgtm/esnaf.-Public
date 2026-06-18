import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Site Oluştur — Esnaf",
  description: "İşletmenizi anlatın, AI web sitenizi dakikalar içinde hazırlasın.",
};

export default function OlusturLayout({ children }: { children: React.ReactNode }) {
  return children;
}
