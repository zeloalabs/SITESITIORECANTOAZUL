import type { Metadata, Viewport } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/lib/content/client";
import { siteUrl } from "@/lib/seo";
import "./globals.css";

// Render sempre por requisição na origem: o cache em memória do vinext é por isolate e não é
// revalidado de forma confiável. O cache público fica na borda (Workers Cache, `src/worker/`),
// com TTL de 60 s e purge pelo webhook do Sanity.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Sítio Recanto Azul", template: "%s | Sítio Recanto Azul" },
  description: "Hospedagem em Alfredo Wagner/SC.",
};

// viewport-fit=cover: necessário para `env(safe-area-inset-*)` (barra fixa de reserva no iPhone).
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { isEnabled } = await draftMode();
  return (
    <html lang="pt-BR">
      <body>
        {children}
        {/* Live só em Draft Mode: no público, cada publicação faria `router.refresh()` fora do cache em toda aba. */}
        {isEnabled ? <SanityLive /> : null}
        {isEnabled ? <VisualEditing /> : null}
      </body>
    </html>
  );
}
