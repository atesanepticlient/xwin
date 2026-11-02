import crypto from "crypto";

/**
 * Low level client for the Merchant Payment API v1.
 * Auth: headers X-Merchant-Code / X-Timestamp / X-Nonce / X-Signature.
 * Signature: all business params + the 3 header values, EXCEPT `key` and `sign`.
 * Empty strings and null are KEPT (as `name=`), undefined/absent fields are not
 * part of the signature. Each `name=value` is sorted as a whole string, then
 * `secret_key=SECRET` is appended, MD5, UPPERCASE. No URL encoding.
 */
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

const str = (v: unknown) =>
  v === null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);

export function makeSign(
  data: Record<string, unknown>,
  secretKey: string,
): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(data)) {
    if (k === "key" || k === "sign" || v === undefined) continue;
    parts.push(`${k}=${str(v)}`);
  }
  parts.sort(); // plain code-unit order == PHP SORT_STRING for ASCII
  parts.push(`secret_key=${secretKey}`);
  return crypto
    .createHash("md5")
    .update(parts.join("&"), "utf8")
    .digest("hex")
    .toUpperCase();
}

/**
 * Verify a callback: signed fields = every received body field
 * + X-Timestamp, X-Nonce, X-Merchant-Code from the headers.
 */
export function verifyCallback(
  headers: Headers,
  payload: Record<string, unknown>,
  secretKey: string,
): boolean {
  const received = (headers.get("x-signature") ?? "").toUpperCase();
  const expected = makeSign(
    {
      ...payload,
      "X-Timestamp": headers.get("x-timestamp") ?? "",
      "X-Nonce": headers.get("x-nonce") ?? "",
      "X-Merchant-Code": headers.get("x-merchant-code") ?? "",
    },
    secretKey,
  );
  if (received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

/** Order number prefixes (see common/order.ts): PKD = deposit, PKW = withdraw. */
export const PK_DEPOSIT_PREFIX = "PKD";
export const PK_WITHDRAW_PREFIX = "PKW";

export interface PkResponse<T = Record<string, unknown>> {
  code?: number; // 0 = success (HTTP status is NOT reliable)
  message?: string;
  data?: T;
}

/**
 * Signed request. Throws on network error / timeout / non-JSON body.
 * Callers decide what "no answer" means (for payouts: still pending).
 */
export async function pkRequest<T = Record<string, unknown>>(
  method: "GET" | "POST",
  path: string,
  business: Record<string, string | undefined> = {},
  userId?: string,
): Promise<PkResponse<T>> {
  const c = pkConfig();
  const timestamp = String(Math.floor(Date.now() / 1000));
  console.log("[PK-PAY TIMESTAMP DEBUG]", {
    timestamp,
    timestampDate: new Date(Number(timestamp) * 1000).toISOString(),
    serverDate: new Date().toISOString(),
    offset: process.env.PKPAY_TIME_OFFSET_SECONDS,
  });

  const nonce = crypto.randomBytes(10).toString("hex");

  const sign = makeSign(
    {
      ...business,
      "X-Merchant-Code": c.merchantId,
      "X-Timestamp": timestamp,
      "X-Nonce": nonce,
    },
    c.secretKey,
  );

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Merchant-Code": c.merchantId,
    "X-Timestamp": timestamp,
    "X-Nonce": nonce,
    "X-Signature": sign,
  };
  if (userId) headers["X-User-Id"] = userId.slice(0, 128);

  let url = `${c.baseUrl}${path}`;
  let body: string | undefined;
  if (method === "GET") {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(business)) {
      if (v !== undefined) qs.set(k, v);
    }
    if ([...qs].length) url += `?${qs.toString()}`;
  } else {
    body = JSON.stringify(business); // undefined fields are dropped = not signed
  }

  const res = await fetch(url, {
    method,
    headers,
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  console.log("[PK-PAY REQUEST]", {
    method,
    url,
    headers: {
      "X-Merchant-Code": c.merchantId,
      "X-Timestamp": timestamp,
      "X-Nonce": nonce,
    },
    body: business,
  });
  return (await res.json()) as PkResponse<T>;
}

export const pkPost = <T = Record<string, unknown>>(
  path: string,
  business: Record<string, string | undefined>,
  userId?: string,
) => pkRequest<T>("POST", path, business, userId);

/** Active order lookup (use when a callback never arrives). */
export const pkQuery = (kind: "receive" | "payout", mchOrderNo: string) =>
  pkRequest(`GET`, `/api/v1/${kind}/queryOrder`, {
    mch_order_no: mchOrderNo,
  });
