import { userHasAgent } from "../common/context";
import { ok } from "../common/http";
import { listWallets, toClientWallet } from "../common/wallets";
import type { FlowHandlers, PaymentFlow, RouteSet } from "../common/types";
import { cryptoDeposit, cryptoWithdraw } from "./handlers";

/** Crypto is available in every country, so there is no country check here. */
const cryptoFlow = (flow: PaymentFlow): FlowHandlers => ({
  async get(ctx) {
    const hasAgent = flow === "withdraw" ? await userHasAgent(ctx.user) : false;
    const rows = await listWallets(flow, "CRYPTO");
    return ok({
      payload: {
        methods: rows.map((w) =>
          toClientWallet(flow, w, { country: null, hasAgent }),
        ),
      },
    });
  },
  post: (ctx) =>
    flow === "deposit" ? cryptoDeposit(ctx) : cryptoWithdraw(ctx),
});

export const cryptoRoutes: RouteSet = {
  deposit: cryptoFlow("deposit"),
  withdraw: cryptoFlow("withdraw"),
};
