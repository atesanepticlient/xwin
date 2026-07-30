import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "flagcdn.com",
      "upload.wikimedia.org",
      "1xbet.com",
      "res.cloudinary.com",
      "download.logo.wine",
      "logos-world.net",
      "image.alt-api.com",
      "www.finder.com",
      "mir-s3-cdn-cf.behance.net",
      "www.dutchbanglabank.com",
      "www.mutualtrustbank.com",
      "mir-s3-cdn-cf.behance.net",
      "cdn.prod.website-files.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
