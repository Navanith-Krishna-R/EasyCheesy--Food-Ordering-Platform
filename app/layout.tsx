import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Easy Cheesy",
    template: "%s | Easy Cheesy",
  },
  description: "Easy Cheesy – Eat easy, feel cheesy.",
  applicationName: "Easy Cheesy",

  metadataBase: new URL("https://easycheesy.store"), // change to your domain

  openGraph: {
    title: "Easy Cheesy",
    description: "Eat easy, feel cheesy.",
    url: "https://easycheesy.store",
    siteName: "Easy Cheesy",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "Easy Cheesy",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Easy Cheesy",
    description: "Eat easy, feel cheesy.",
    images: ["/icon.png"],
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
