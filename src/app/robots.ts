import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.livvbet.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/account/profile",
        "/account/deposit",
        "/account/withdraw",
        "/account/security",
        "/account/transaction",
        "/account/message",
        "/account/bet-history",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
