import type { NextRequest } from "next/server";
import { hasEwalletCountry } from "./catalog";
import { withContext, userHasAgent } from "./context";
import { cryptoDeposit, cryptoWithdraw } from "./crypto";
import { ewalletPost } from "./ewallet";
import { fail, ok } from "./http";
import { listCountryEwallets, listWallets, toClientWallet } from "./wallets";
import type {
  CountryCode,
  FlowHandlers,
  PaymentContext,
  PaymentFlow,
  RouteSet,
} from "./types";

/* ---------------- per-country route set (BD, PK, ...) ---------------- */

const countryFlow = (flow: PaymentFlow, code: CountryCode): FlowHandlers => {
  // A country route only serves accounts of that country. This is what stops
  // a BDT account from calling /api/payment/pk/... directly.
  const guard = (ctx: PaymentContext) =>
    ctx.country !== code
      ? fail(`${code} payments are not available for this account`, 403)
      : null;

  return {
    async get(ctx) {
      const denied = guard(ctx);
      if (denied) return denied;
      const hasAgent = flow === "withdraw" ? await userHasAgent(ctx.user) : false;
      const rows = await listCountryEwallets(flow, code);
      return ok({
        payload: {
          country: code,
          currency: ctx.currency,
          methods: rows.map((w) => toClientWallet(flow, w, { country: code, hasAgent })),
        },
      });
    },
    async post(ctx) {
      const denied = guard(ctx);
      if (denied) return denied;
      return ewalletPost(flow, ctx, code);
    },
  };
};

export const createCountryRoutes = (code: CountryCode): RouteSet => ({
  deposit: countryFlow("deposit", code),
  withdraw: countryFlow("withdraw", code),
});

/* ---------------- accounts with no e-wallet country ---------------- */

const noEwalletFlow = (): FlowHandlers => ({
  get: async (ctx) =>
    ok({ payload: { country: ctx.country, currency: ctx.currency, methods: [] } }),
  post: async () => fail("E-wallet payments are not available in your region."),
});

export const noEwalletRoutes: RouteSet = {
  deposit: noEwalletFlow(),
  withdraw: noEwalletFlow(),
};

/* ---------------- crypto route set (everyone) ---------------- */

const cryptoFlow = (flow: PaymentFlow): FlowHandlers => ({
  async get(ctx) {
    const hasAgent = flow === "withdraw" ? await userHasAgent(ctx.user) : false;
    const rows = await listWallets(flow, "CRYPTO");
    return ok({
      payload: {
        methods: rows.map((w) => toClientWallet(flow, w, { country: ctx.country, hasAgent })),
      },
    });
  },
  post: (ctx) => (flow === "deposit" ? cryptoDeposit(ctx) : cryptoWithdraw(ctx)),
});

export const cryptoRoutes: RouteSet = {
  deposit: cryptoFlow("deposit"),
  withdraw: cryptoFlow("withdraw"),
};

/* ---------------- adapter: FlowHandlers -> Next.js route exports ---------------- */

export const toRouteExports = (h: FlowHandlers) => ({
  GET: (req: NextRequest) => withContext(req, h.get),
  POST: (req: NextRequest) => withContext(req, h.post),
});

export { hasEwalletCountry };
