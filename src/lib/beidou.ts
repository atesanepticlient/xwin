import crypto from "crypto";

export interface BeiDouConfig {
  baseUrl: string;
  merchantId: string;
  secretKey: string;
}

export interface BeiDouApiResponse<T = Record<string, unknown>> {
  code: number;
  msg: string;
  data?: T;
}

export interface CreateCollectionParams {
  merchantOrderId: string;
  transAmt: string | number;
  payType: number;

  orderRemark?: string;
}

export interface CreatePaymentParams {
  account: string;
  bnkCode?: string;
  payType: string | number;
  remark?: string;
    transAmt: string | number;
}

export const CONFIG: BeiDouConfig = {
  baseUrl: process.env.BEIDOU_BASE_URL!,
  merchantId: process.env.BEIDOU_MERCHANT_ID!,
  secretKey: process.env.BEIDOU_SECRET_KEY!,
};

export function cleanParams(
  params: Record<string, unknown>,
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const k of Object.keys(params)) {
    if (k === "sign") continue;
    const v = params[k];
    if (v === undefined || v === null) continue;
    cleaned[k] = v;
  }
  return cleaned;
}

export function buildSign(params: Record<string, unknown>): string {
  const cleaned = cleanParams(params);
  const keys = Object.keys(cleaned).sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );

  const joined = keys.map((k) => `${k}=${cleaned[k]}`).join("&");
  const plaintext = `${joined}&${CONFIG.secretKey}`;

  return crypto.createHash("md5").update(plaintext, "utf8").digest("hex");
}

export async function postJson<T = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown>,
): Promise<BeiDouApiResponse<T>> {
  const url = `${CONFIG.baseUrl}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} calling ${path}: ${await res.text()}`);
  }

  const data: BeiDouApiResponse<T> = await res.json();
  if (data.code !== 200) {
    throw new Error(`BeiDou error [${data.code}] on ${path}: ${data.msg}`);
  }
  return data;
}
