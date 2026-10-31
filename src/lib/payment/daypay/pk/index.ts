import { createCountryRoutes } from "../common/routes";
import type { CountryModule } from "../common/types";
import { pkPayProvider } from "./provider";

/**
 * Pakistan (PKR): JazzCash, EasyPaisa, through the PK gateway.
 * Callbacks: /api/payment/pk/callback/payin and /payout (see callbacks.ts).
 */
export const pk: CountryModule = {
  code: "PK",
  provider: pkPayProvider,
  methods: [
    { key: "jazzcash", label: "JazzCash", match: ["jazzcash"] },
    { key: "easypaisa", label: "EasyPaisa", match: ["easypaisa", "easypesa"] },
  ],
};

export const pkRoutes = createCountryRoutes(pk);
