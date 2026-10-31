import { createCountryRoutes } from "../common/routes";
import type { CountryModule } from "../common/types";
import { beidouProvider } from "./provider";

/**
 * Bangladesh (BDT): bKash, Nagad, Rocket, Upay, all through Beidou (DayPay).
 * Upay has no payType in provider.ts yet, so it answers "isn't wired up yet".
 *
 * Callbacks keep their old URLs (the gateway is configured with them):
 *   /api/daypay/collection   deposit callback
 *   /api/daypay/payment      withdraw callback
 */
export const bd: CountryModule = {
  code: "BD",
  provider: beidouProvider,
  methods: [
    { key: "bkash", label: "bKash", match: ["bkash"] },
    { key: "nagad", label: "Nagad", match: ["nagad"] },
    { key: "rocket", label: "Rocket", match: ["rocket"] },
    { key: "upay", label: "Upay", match: ["upay"] },
  ],
};

export const bdRoutes = createCountryRoutes(bd);
