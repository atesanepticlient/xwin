import type { PaymentProvider, ProviderRequest, ProviderResult } from "../types";

/**
 * PK providers: JazzCash, EasyPaisa. DEMO ONLY.
 *
 * Nothing is sent to a gateway, nothing is saved and the wallet is never
 * touched (isDemo = true makes the shared withdraw handler skip the debit).
 *
 * When a real PK provider is ready:
 *   1. add providers/<name>.ts with the same two functions,
 *   2. register it in providers/index.ts and in ProviderKey (types.ts),
 *   3. point the PK entries in catalog.ts at it.
 * Nothing else changes.
 */
const demo = (r: ProviderRequest, flow: "deposit" | "withdraw"): ProviderResult => {
  console.info(
    `[pk-demo] ${flow} ${r.method} amount=${r.amount} user=${r.ctx.user.id}`,
  );
  return {
    ok: false,
    status: 501,
    demo: true,
    message: `${r.wallet.walletName} ${flow} is in demo mode, the provider is not connected yet.`,
  };
};

export const pkDemoProvider: PaymentProvider = {
  key: "pk-demo",
  isDemo: true,
  deposit: async (r) => demo(r, "deposit"),
  withdraw: async (r) => demo(r, "withdraw"),
};
