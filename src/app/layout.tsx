import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "MenuJá - Cardápio Digital Online | Crie sua Loja Grátis",
  description: "Crie seu cardápio digital e receba pedidos online. Ideal para pizzarias, lanchonetes, açaíterias e delivery. Teste grátis por 14 dias!",
  keywords: ["cardápio digital", "cardápio online", "delivery online", "loja virtual", "pedidos online", "cardápio delivery", "menu digital", "pizzaria online", "lanche delivery", "açaí online"],
  authors: [{ name: "MenuJá" }],
  creator: "MenuJá",
  metadataBase: new URL("https://menuja.app.br"),
  alternates: {
    canonical: "https://menuja.app.br",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://menuja.app.br",
    title: "MenuJá - Crie seu Cardápio Digital Grátis",
    description: "Receba pedidos online com seu próprio cardápio digital. Simples, rápido e sem complicação. Teste grátis por 14 dias!",
    siteName: "MenuJá",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MenuJá - Cardápio Digital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MenuJá - Crie seu Cardápio Digital Grátis",
    description: "Receba pedidos online com seu próprio cardápio digital. Teste grátis por 14 dias!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "MenuJá",
              "description": "Crie seu cardápio digital e receba pedidos online",
              "url": "https://menuja.app.br",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "BRL",
                "description": "Teste grátis por 14 dias"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              }
            })
          }}
        />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
