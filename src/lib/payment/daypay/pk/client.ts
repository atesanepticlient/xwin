import crypto from "crypto";

/**
 * Low level client for the PK gateway (JazzCash + EasyPaisa).
 * Signature: sort non-empty params (without sign and ext_info) by name,
 * join as key=value with "&", append "&key=SECRET", MD5, UPPERCASE.
 */
export const PK_COUNTRY = "PK";

export const pkConfig = () => ({
  baseUrl: (process.env.PKPAY_BASE_URL ?? "").replace(/\/+$/, ""),
  merchantId: process.env.PKPAY_MERCHANT_ID ?? "",
  secretKey: process.env.PKPAY_SECRET_KEY ?? "",
  notifyBase: (
    process.env.PKPAY_NOTIFY_BASE_URL ??
    process.env.CLINET_URL ??
    ""
  ).replace(/\/+$/, ""),
});

export const pkConfigured = () => {
  const c = pkConfig();
  return Boolean(c.baseUrl && c.merchantId && c.secretKey && c.notifyBase);
};

export function signParams(
  params: Record<string, unknown>,
  secretKey: string,
): string {
  const keys = Object.keys(params)
    .filter(
      (k) =>
        k !== "sign" &&
        k !== "ext_info" &&
        params[k] !== undefined &&
        params[k] !== null &&
        params[k] !== "",
    )
    .sort();
  const raw =
    keys.map((k) => `${k}=${params[k]}`).join("&") + `&key=${secretKey}`;
  return crypto
    .createHash("md5")
    .update(raw, "utf8")
    .digest("hex")
    .toUpperCase();
}

/** Case-insensitive, constant-time check of a callback's sign. */
export function verifyParams(
  params: Record<string, unknown>,
  secretKey: string,
): boolean {
  const received = String(params.sign ?? "").toUpperCase();
  const expected = signParams(params, secretKey);
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

/** Order number prefixes (see common/order.ts): PKD = deposit, PKW = withdraw. */
export const PK_DEPOSIT_PREFIX = "PKD";
export const PK_WITHDRAW_PREFIX = "PKW";

export interface PkResponse<T = Record<string, unknown>> {
  code?: number;
  msg?: string;
  data?: T;
}

/**
 * POST JSON to the gateway. Throws on network error / timeout / non-JSON
 * body. Callers decide what "no answer" means (for payouts: still pending).
 */
export async function pkPost<T = Record<string, unknown>>(
  path: string,
  business: Record<string, string | undefined>,
): Promise<PkResponse<T>> {
  const c = pkConfig();
  const params: Record<string, string> = {
    merchant_id: c.merchantId,
    country: PK_COUNTRY,
    timestamp: String(Math.floor(Date.now() / 1000)),
    nonce: crypto.randomBytes(10).toString("hex"), // 20 chars
  };
  for (const [k, v] of Object.entries(business)) {
    if (v !== undefined && v !== "") params[k] = v;
  }
  params.sign = signParams(params, c.secretKey);

  const res = await fetch(`${c.baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  return (await res.json()) as PkResponse<T>;
}
