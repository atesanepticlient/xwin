import crypto from "crypto";

/**
 * Low level client for the BD gateway (bKash, Nagad, Rocket).
 * Signature: sort non-empty params (minus the ones that are not signed) by
 * name, join as key=value with "&", append "&key=SECRET", MD5, lowercase.
 */
export const bdConfig = () => ({
  baseUrl: (process.env.BDPAY_BASE_URL ?? "").replace(/\/+$/, ""),
  partner: process.env.BDPAY_PARTNER ?? "",
  secretKey: process.env.BDPAY_SECRET_KEY ?? "",
  notifyBase: (
    process.env.BDPAY_NOTIFY_BASE_URL ??
    process.env.CLINET_URL ??
    ""
  ).replace(/\/+$/, ""),
});

export const bdConfigured = () => {
  const c = bdConfig();
  return Boolean(c.baseUrl && c.partner && c.secretKey && c.notifyBase);
};

/** Order number prefixes (see common/order.ts): BDD = deposit, BDW = withdraw. */
export const BD_DEPOSIT_PREFIX = "BDD";
export const BD_WITHDRAW_PREFIX = "BDW";

/** Request fields the doc says are not part of the signature. */
const NOT_SIGNED = ["sign", "IP", "remark"];

function signWith(
  params: Record<string, unknown>,
  secretKey: string,
  skip: string[],
): string {
  const keys = Object.keys(params)
    .filter(
      (k) =>
        !skip.includes(k) &&
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
    .toLowerCase();
}

export const signBd = (params: Record<string, unknown>, secretKey: string) =>
  signWith(params, secretKey, NOT_SIGNED);

/**
 * Callback signature (both pay-in and payout notifications):
 *   opstate=..&orderid=..&ovalue=..&parter=<partner id>&key=SECRET
 * The doc's parameter table also says a non-empty `remark` is signed, which
 * contradicts the signature line. We never send a remark, but if the gateway
 * adds one we accept either form. Both need the secret key.
 */
export function verifyCallback(
  q: Record<string, string>,
  secretKey: string,
): boolean {
  const received = (q.sign ?? "").toLowerCase();
  if (!received) return false;

  const base = {
    opstate: q.opstate,
    orderid: q.orderid,
    ovalue: q.ovalue,
    parter: q.parter,
  };
  const candidates = [signWith(base, secretKey, [])];
  if (q.remark)
    candidates.push(signWith({ ...base, remark: q.remark }, secretKey, []));

  return candidates.some(
    (expected) =>
      expected.length === received.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(received)),
  );
}

export interface BdResponse {
  /** the gateway sends 200 as a number or as a string */
  code?: number | string;
  info?: string;
  param?: { payment_url?: string } & Record<string, unknown>;
}

/**
 * POST JSON to the gateway. Throws on network error / timeout / non-JSON
 * body. Callers decide what "no answer" means (for payouts: still pending).
 */
export async function bdPost(
  path: string,
  business: Record<string, string | undefined>,
): Promise<BdResponse> {
  const c = bdConfig();
  const params: Record<string, string> = { partner: c.partner };
  for (const [k, v] of Object.entries(business)) {
    if (v !== undefined && v !== "") params[k] = v;
  }
  params.sign = signBd(params, c.secretKey);

  const res = await fetch(`${c.baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });

  return (await res.json()) as BdResponse;
}
