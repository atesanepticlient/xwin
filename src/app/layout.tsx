import type { Metadata } from "next";
import { Roboto, Inter, Russo_One } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import { Suspense } from "react";
import StoreProvider from "./StoreProvider";
import GamesLoader from "./GamesLoader";
import Intro from "./intro";
import { InternetProvider } from "./internet-provider";
import InternetGate from "@/components/InternetGate";
import AuthGuard from "./AuthGuard";
import { SessionWatcher } from "./session-watcher";
import AppInitializer from "./AppInitializer";
import PullToRefresh from "@/components/PullToRefresh";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});

// Configure Russo One font
const russoOne = Russo_One({
  weight: "400",
  variable: "--font-russo-one",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.winparibet.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "WinpariBet - #1 Online Sports Betting, Live Casino & Games",
    template: "%s | WinpariBet",
  },
  description:
    "Join WinpariBet for the ultimate online betting experience! Top odds on Sports, Cricket betting, Football, Live Dealers, Online Casino Slots, Aviator crash game, instant deposits & fast payouts. Register now on Livvbet Official Site!",
  keywords: [
    "WinpariBet",
    "WinpariBet casino",
    "WinpariBet sports betting",
    "WinpariBet online betting",
    "WinpariBet official site",
    "WinpariBet login",
    "WinpariBet registration",
    "WinpariBet app",
    "WinpariBet Bangladesh",
    "WinpariBet live casino",
    "cricket betting odds",
    "online slots Bangladesh",
    "Aviator crash game",
  ],
  authors: [{ name: "WinpariBet", url: siteUrl }],
  creator: "WinpariBet",
  publisher: "Livvbet",
  applicationName: "Livvbet",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/assets/svg/livvbet-main-logo.svg", type: "image/svg+xml" },
      { url: "/assets/images/icon.ico", sizes: "any" },
    ],
    apple: [{ url: "/app/apple-icon.png" }],
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
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Livvbet - Official Online Sports Betting & Live Casino Platform",
    description:
      "Join Livvbet for the best sports betting odds, live casino dealers, slots, and fast withdrawals. Play on Livvbet today!",
    url: siteUrl,
    siteName: "Livvbet",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${siteUrl}/assets/svg/livvbet-main-logo.svg`,
        width: 1200,
        height: 630,
        alt: "Livvbet - Official Online Sports Betting & Casino",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Livvbet - Official Online Sports Betting & Live Casino",
    description:
      "Join Livvbet for live sports betting, online casino games, slots & fast payouts.",
    images: [`${siteUrl}/assets/svg/livvbet-main-logo.svg`],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // JSON-LD Structured Data for Google Search & Brand Knowledge Graph
  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Livvbet",
    alternateName: ["Livvbet Official", "Livvbet Casino", "Livvbet Sports"],
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/sports?redirect=search-events&q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Livvbet",
    url: siteUrl,
    logo: `${siteUrl}/assets/svg/livvbet-main-logo.svg`,
    description:
      "Livvbet is a global online sports betting and live casino company providing premium sports odds, live dealers, slots, and crash games.",
    sameAs: [
      "https://t.me/Livvbet_Support",
      "https://agent.livvbet.com",
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([jsonLdWebsite, jsonLdOrganization]),
          }}
        />
      </head>
      <body
        className={` ${inter.variable} ${roboto.variable} ${russoOne.variable} font-inter antialiased !text-white`}
      >
        <Suspense>
          <SessionProvider session={session}>
            <StoreProvider>
              <InternetProvider>
                <InternetGate>
                  <SessionWatcher />
                  {children}
                  <PullToRefresh />
                  <AppInitializer />
                </InternetGate>
              </InternetProvider>
              <Intro />
            </StoreProvider>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
