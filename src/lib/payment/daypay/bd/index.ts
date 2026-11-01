import { createCountryRoutes } from "../common/routes";
import type { CountryModule } from "../common/types";
import { bdPayProvider } from "./provider";

/**
 * Bangladesh (BDT): bKash, Nagad, Rocket through the BD gateway.
 * Upay is not in the gateway doc, so it answers "isn't wired up yet".
 * Callbacks (GET): /api/payment/bd/callback/payin and /payout (see callbacks.ts).
 */
export const bd: CountryModule = {
  code: "BD",
  provider: bdPayProvider,
  methods: [
    { key: "bkash", label: "bKash", match: ["bkash"] },
    { key: "nagad", label: "Nagad", match: ["nagad"] },
    { key: "rocket", label: "Rocket", match: ["rocket"] },
    { key: "upay", label: "Upay", match: ["upay"] },
  ],
};

export const bdRoutes = createCountryRoutes(bd);
