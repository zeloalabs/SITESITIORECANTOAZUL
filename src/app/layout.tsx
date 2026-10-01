import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/lib/content/client";
import "./globals.css";

// Render sempre por requisição na origem: o cache em memória do vinext é por isolate e não é
// revalidado de forma confiável. O cache público fica na borda (Workers Cache, `src/worker/`),
// com TTL de 60 s e purge pelo webhook do Sanity.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sítio Recanto Azul",
  description: "Hospedagem em Alfredo Wagner/SC.",
};

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
