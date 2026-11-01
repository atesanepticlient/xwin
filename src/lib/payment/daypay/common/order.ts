import crypto from "crypto";

/**
 * Our order numbers carry a prefix per country and flow (BDD, BDW, PKD, PKW).
 * Callbacks refuse any other prefix, so crypto rows (which store a user-typed
 * tx hash in the same merchantId column) can never be matched by a gateway.
 */
export const newOrderNo = (prefix: string) =>
  `${prefix}${Date.now()}${crypto.randomBytes(6).toString("hex")}`;
