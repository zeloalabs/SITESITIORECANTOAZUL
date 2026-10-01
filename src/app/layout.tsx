import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/lib/content/client";
import "./globals.css";

// Sem cache compartilhado no Worker (sem workers-cache/KV/R2/DO), o cache em memória do vinext
// fica preso por isolate e a revalidação do SanityLive não alcança os outros. Conteúdo sempre
// renderizado por requisição; o frescor vem do apicdn do Sanity.
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
        <SanityLive />
        {isEnabled ? <VisualEditing /> : null}
      </body>
    </html>
  );
}
