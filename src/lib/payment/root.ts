import type { NextRequest } from "next/server";
import { withContext, userHasAgent } from "./context";
import { asString, fail, ok } from "./http";
import { getCountryRoutes } from "./registry";
import { cryptoRoutes } from "./routes";
import { listCountryEwallets, listWallets, loadWallet, toClientWallet } from "./wallets";
import type { PaymentFlow } from "./types";

const LIVVBET_CASH_ICON =
  "https://res.cloudinary.com/dxs9u7pqc/image/upload/v1749203759/dollars_bhgsma.png";

/**
 * ROOT GET  (/api/payment/deposit, /api/payment/withdraw)
 * Country's e-wallets + crypto, grouped the way the UI already expects.
 */
export const rootGet = (req: NextRequest, flow: PaymentFlow) =>
  withContext(req, async (ctx) => {
    const hasAgent = await userHasAgent(ctx.user);
    const opts = { country: ctx.country, hasAgent };

    const [ewallets, cryptos] = await Promise.all([
      listCountryEwallets(flow, ctx.country),
      listWallets(flow, "CRYPTO"),
    ]);
    const all: Record<string, unknown>[] = [...ewallets, ...cryptos].map((w) =>
      toClientWallet(flow, w, opts),
    );

    const groups: { methodName: string; wallets: Record<string, unknown>[] }[] = [
      { methodName: "Recommended", wallets: all.filter((w) => w.isRecommended) },
      { methodName: "E-Wallet", wallets: all.filter((w) => w.category === "MOBILE_BANKING") },
      { methodName: "Crypto", wallets: all.filter((w) => w.category === "CRYPTO") },
    ];

    if (flow === "withdraw") {
      groups.push({
        methodName: "WinpariBet Cash",
        wallets: [
          {
            id: "livvbet-cash",
            name: "Livvbet Cash",
            label: "Livvbet Cash",
            type: "cash",
            isActive: hasAgent,
            image: LIVVBET_CASH_ICON,
            isRecommended: false,
          },
        ],
      });
    }

    return ok({
      payload: {
        country: ctx.country,
        currency: ctx.currency,
        [flow]: groups.filter((g) => g.wallets.length > 0),
      },
    });
  });

/**
 * ROOT POST. Decides where the request goes:
 *   crypto wallet  -> crypto routes        (everyone)
 *   e-wallet       -> the account's country routes (BD / PK / none)
 * The forward is a direct function call (no HTTP hop, no redirect), so the
 * request body and the session cookie are used exactly once.
 */
export const rootPost = (req: NextRequest, flow: PaymentFlow) =>
  withContext(req, async (ctx) => {
    const walletId = asString(ctx.body.walletId);
    if (!walletId) return fail("Missing required parameter: walletId");

    const wallet = await loadWallet(flow, walletId);
    if (!wallet) {
      return fail(
        flow === "deposit"
          ? "This deposit method is unavailable."
          : "This withdrawal method is unavailable.",
      );
    }
    ctx.wallet = wallet;

    const target =
      wallet.category === "CRYPTO" ? cryptoRoutes : getCountryRoutes(ctx.country);

    return target[flow].post(ctx);
  });
