import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tixconcert.com"),
  title: {
    default: "TIXCONCERT - Your Gateway to Live Music",
    template: "%s | TIXCONCERT",
  },
  description:
    "Platform penjualan tiket konser terpercaya. Temukan konser favoritmu dan dapatkan tiketnya dengan mudah. VIP, Festival, dan Regular.",
  keywords: [
    "tiket konser",
    "concert ticket",
    "Soundwave Festival",
    "Java Music Fest",
    "TIXCONCERT",
    "beli tiket konser",
  ],
  openGraph: {
    title: "TIXCONCERT - Your Gateway to Live Music",
    description:
      "Temukan konser favoritmu dan dapatkan tiketnya dengan mudah.",
    type: "website",
    locale: "id_ID",
    siteName: "TIXCONCERT",
  },
  twitter: {
    card: "summary_large_image",
    title: "TIXCONCERT - Your Gateway to Live Music",
    description:
      "Temukan konser favoritmu dan dapatkan tiketnya dengan mudah.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakarta.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
