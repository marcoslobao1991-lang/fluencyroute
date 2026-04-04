import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Fluency Route — Aprenda Inglês com Música",
    template: "%s | Fluency Route",
  },
  description: "Aprenda inglês de verdade ouvindo música. Método científico baseado em repetição musical que hackeia seu cérebro pra adquirir inglês naturalmente.",
  metadataBase: new URL("https://fluencyroute.com.br"),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Fluency Route",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={dmSans.variable}>
      <body style={{ margin: 0, padding: 0, background: "#0A0A0A", color: "#fff", fontFamily: "var(--font-dm-sans), sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
