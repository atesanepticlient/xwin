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

export const metadata: Metadata = {
  title: "WinpariBet",
  description:
    "WinpariBet Company Trusted Online Betting Site in Bangladesh, Join 1xbet companl for the ultimate betting experience! Enjoy sports betting, casino games, live dealers, Aviator crash game, and more. Get the best odds and exciting bonuses. Sign up now!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="en">
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
                </InternetGate>
              </InternetProvider>
              <Intro />
              <GamesLoader />
            </StoreProvider>
          </SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
