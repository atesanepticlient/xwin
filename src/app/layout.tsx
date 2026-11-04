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
    template: "%s",
  },
  description:
    "Join WinpariBet for the ultimate online betting experience! Top odds on Sports, Cricket betting, Football, Live Dealers, Online Casino Slots, Aviator crash game, instant deposits & fast payouts. Register now on the WinpariBet Official Site!",
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
    "winparibet",
    "win pari bet",
    "winpari bet",
    "online sports betting",
    "live casino",
    "cricket betting odds",
    "online slots Bangladesh",
    "Aviator crash game",
  ],
  authors: [{ name: "WinpariBet", url: siteUrl }],
  creator: "WinpariBet",
  publisher: "WinpariBet",
  applicationName: "WinpariBet",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/assets/images/logo.png", type: "image/png", sizes: "any" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png" }],
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
    title: "WinpariBet - Official Online Sports Betting & Live Casino Platform",
    description:
      "Join WinpariBet for the best sports betting odds, live casino dealers, slots, and fast withdrawals. Play on WinpariBet today!",
    url: siteUrl,
    siteName: "WinpariBet",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${siteUrl}/assets/images/logo.png`,
        width: 1035,
        height: 255,
        alt: "WinpariBet - Official Online Sports Betting & Casino",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WinpariBet - Official Online Sports Betting & Live Casino",
    description:
      "Join WinpariBet for live sports betting, online casino games, slots & fast payouts.",
    images: [`${siteUrl}/assets/images/logo.png`],
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
    name: "WinpariBet",
    alternateName: ["WinpariBet Official", "WinpariBet Casino", "WinpariBet Sports"],
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
    name: "WinpariBet",
    url: siteUrl,
    logo: `${siteUrl}/assets/images/logo.png`,
    description:
      "WinpariBet is a global online sports betting and live casino company providing premium sports odds, live dealers, slots, and crash games.",
    sameAs: [
      "https://t.me/WinpariBet_Support",
      "https://agent.winparibet.com",
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
