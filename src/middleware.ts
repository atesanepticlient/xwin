import NextAuth from "next-auth";
import { authRoutes, publicRoutes, providerApiPrefix } from "./routes";
import authConfig from "./auth.config";

const { auth } = NextAuth({ ...authConfig });

export default auth(async (req) => {
  const host = req.headers.get("host") || "";

  // Remove port if running locally
  const hostname = host.split(":")[0];

  if (hostname.startsWith("mobile.")) {
    return Response.redirect(new URL("https://winparibet.com", req.url));
  }

  const { nextUrl } = req;
  const session = !!req.auth;

  const isAuthRoute = authRoutes.includes(nextUrl.pathname);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isProvider = nextUrl.pathname.startsWith(providerApiPrefix);

  if (session && isAuthRoute && !isProvider) {
    return Response.redirect(new URL("/", nextUrl));
  }

  if (!session && !isPublicRoute && !isProvider && !isAuthRoute) {
    const callbackUrl = nextUrl.pathname + nextUrl.search;
    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(
      new URL(`/login?redirect=${encodedCallbackUrl}`, nextUrl),
    );
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
