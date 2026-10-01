import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { SanityLive } from "@/lib/content/live";
import "./globals.css";

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
