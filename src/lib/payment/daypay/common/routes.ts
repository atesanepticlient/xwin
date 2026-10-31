import type { NextRequest } from "next/server";
import { withContext, userHasAgent } from "./context";
import { ewalletPost } from "./ewallet";
import { fail, ok } from "./http";
import { listCountryEwallets, toClientWallet } from "./wallets";
import type {
  CountryModule,
  FlowHandlers,
  PaymentContext,
  PaymentFlow,
  RouteSet,
} from "./types";

/** Route set of one country, built from its CountryModule (bd/index.ts, pk/index.ts). */
const countryFlow = (
  flow: PaymentFlow,
  country: CountryModule,
): FlowHandlers => {
  // A country route only serves accounts of that country. This is what stops
  // a BDT account from calling /api/payment/pk/... directly.
  const guard = (ctx: PaymentContext) =>
    ctx.country !== country.code
      ? fail(`${country.code} payments are not available for this account`, 403)
      : null;

  return {
    async get(ctx) {
      const denied = guard(ctx);
      if (denied) return denied;
      const hasAgent =
        flow === "withdraw" ? await userHasAgent(ctx.user) : false;
      const rows = await listCountryEwallets(flow, country);
      return ok({
        payload: {
          country: country.code,
          currency: ctx.currency,
          methods: rows.map((w) =>
            toClientWallet(flow, w, { country, hasAgent }),
          ),
        },
      });
    },
    async post(ctx) {
      const denied = guard(ctx);
      if (denied) return denied;
      return ewalletPost(flow, ctx, country);
    },
  };
};

export const createCountryRoutes = (country: CountryModule): RouteSet => ({
  deposit: countryFlow("deposit", country),
  withdraw: countryFlow("withdraw", country),
});

/** Accounts whose country has no e-wallets (e.g. INR, USD): crypto only. */
const noEwalletFlow = (): FlowHandlers => ({
  get: async (ctx) =>
    ok({
      payload: { country: ctx.country, currency: ctx.currency, methods: [] },
    }),
  post: async () => fail("E-wallet payments are not available in your region."),
});

export const noEwalletRoutes: RouteSet = {
  deposit: noEwalletFlow(),
  withdraw: noEwalletFlow(),
};

/** FlowHandlers -> the { GET, POST } a Next.js route.ts exports. */
export const toRouteExports = (h: FlowHandlers) => ({
  GET: (req: NextRequest) => withContext(req, h.get),
  POST: (req: NextRequest) => withContext(req, h.post),
});
