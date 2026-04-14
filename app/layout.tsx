import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import PageViewTracker from "./PageViewTracker";

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
      <head>
        {/* Facebook Pixel — init only. PageView is fired by <PageViewTracker /> (dual: browser + CAPI dedupada via eventID). */}
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init','938768337634102');
        `}</Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=938768337634102&ev=PageView&noscript=1" />
        </noscript>
        {/* Prefetch checkout pra abertura instantânea */}
        <link rel="dns-prefetch" href="https://go.fluencyroute.com.br" />
        <link rel="preconnect" href="https://go.fluencyroute.com.br" />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#0A0A0A", color: "#fff", fontFamily: "var(--font-dm-sans), sans-serif" }}>
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
