import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sítio Recanto Azul",
  description: "Hospedagem em Alfredo Wagner/SC.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
