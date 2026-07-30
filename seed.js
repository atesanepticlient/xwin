/**
 * BeiDou Payment API Client
 * ---------------------------------------------------------
 * Covers all 5 endpoints from the BeiDou documentation:
 *   1. Balance Inquiry
 *   2. Create Collection Order (deposit / pay-in)
 *   3. Query Collection Order
 *   4. Create Payment Order (withdrawal / payout)
 *   5. Query Payment Order
 *
 * Requires Node.js 18+ (built-in fetch + crypto).
 * Run: node beidou-client.js
 * ---------------------------------------------------------
 */

import crypto from "crypto";
// ------------------------- CONFIG -------------------------
// Fill these in with your real credentials before running.
const CONFIG = {
  baseUrl: "https://api.bd.bd-payment.com",
  merchantId: "2077418268446629889",
  secretKey: "ef2a6df1b059f8096fdb503b3ec18d4a", // the "盐" / salt used in signing
};

// ------------------------- SIGNING -------------------------
/**
 * Builds the MD5 signature for a params object, following the doc's rule:
 *  - exclude "sign"
 *  - exclude null/undefined values (empty params should not be sent)
 *  - sort keys ascending by ASCII
 *  - join as key=value pairs with "&"
 *  - append secretKey at the end
 *  - MD5 hash the whole string
 */
/**
 * Removes "sign" plus any null/undefined values from a params object.
 * IMPORTANT — this does NOT strip empty strings ("").
 *
 * Per the doc's own Java reference implementation, a field is only left out
 * of the signature if it's actually null/not-set. If a field is present
 * with an empty-string value (e.g. bnkCode: ""), it must still appear in
 * the signed string as "bnkCode=" and in the request body, otherwise your
 * signature and the server's recomputed signature will disagree.
 *
 * So: to OMIT a field entirely, don't pass it (leave it undefined).
 * To send it as intentionally empty (e.g. bnkCode), pass "" explicitly —
 * it will be kept in both the signature and the body.
 */
function cleanParams(params) {
  const cleaned = {};
  for (const k of Object.keys(params)) {
    if (k === "sign") continue;
    const v = params[k];
    if (v === undefined || v === null) continue;
    cleaned[k] = v;
  }
  return cleaned;
}

function buildSign(params, secretKey) {
  const cleaned = cleanParams(params);
  const keys = Object.keys(cleaned).sort((a, b) =>
    a < b ? -1 : a > b ? 1 : 0,
  );

  const joined = keys.map((k) => `${k}=${cleaned[k]}`).join("&");
  const plaintext = `${joined}&${secretKey}`;

  return crypto.createHash("md5").update(plaintext, "utf8").digest("hex");
}

/**
 * Verifies an inbound callback's signature the same way.
 */
function verifySign(params, secretKey) {
  const { sign, ...rest } = params;
  const expected = buildSign(rest, secretKey);
  return expected === sign;
}

// ------------------------- HTTP HELPER -------------------------
async function postJson(path, body) {
  const url = `${CONFIG.baseUrl}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} calling ${path}: ${await res.text()}`);
  }

  const data = await res.json();
  if (data.code !== 200) {
    throw new Error(`BeiDou error [${data.code}] on ${path}: ${data.msg}`);
  }
  return data;
}

// ------------------------- API CALLS -------------------------

/** 1. Balance Inquiry */
async function getBalance() {
  const params = { merchantId: CONFIG.merchantId };
  const sign = buildSign(params, CONFIG.secretKey);
  return postJson("/api/order/amount/balance", {
    ...cleanParams(params),
    sign,
  });
}

/**
 * 2. Create a Collection Order (deposit / pay-in)
 * payType: 1 = nagad, 2 = bkash, 3 = rocket
 */
async function createCollectionOrder({
  merchantOrderId,
  transAmt,
  payType,
  payerKey,
  payerName,
  ip,
  orderRemark,
  callbackUrl,
}) {
  const params = {
    merchantId: CONFIG.merchantId,
    merchantOrderId,
    transAmt: String(transAmt),
    payType,
    payerKey,
    payerName,
    ip,
    orderRemark,
    callbackUrl,
  };
  const sign = buildSign(params, CONFIG.secretKey);
  return postJson("/api/order/api/payOrder/publicCreatePayOrder", {
    ...cleanParams(params),
    sign,
  });
}

/** 3. Query a Collection Order */
async function queryCollectionOrder({ merchantOrderId }) {
  const params = { merchantId: CONFIG.merchantId, merchantOrderId };
  const sign = buildSign(params, CONFIG.secretKey);
  return postJson("/api/order/api/payOrder/queryPayOrder", {
    ...cleanParams(params),
    sign,
  });
}

/**
 * 4. Create a Payment Order (withdrawal / payout)
 * payType: 1 = nagad, 2 = bkash, 3 = rocket
 */
async function createPaymentOrder({
  merchantOrderId,
  account,
  transAmt,
  bnkCode = "",
  ip,
  name,
  payType,
  remark,
  callbackUrl,
}) {
  const params = {
    merchantId: CONFIG.merchantId,
    merchantOrderId,
    account,
    transAmt: String(transAmt),
    bnkCode, // required reserved field — "" is a valid, intentional value
    ip,
    name,
    payType: String(payType),
    remark,
    callbackUrl,
  };
  const sign = buildSign(params, CONFIG.secretKey);
  return postJson("/api/order/api/order/publicWithdrawal", {
    ...cleanParams(params),
    sign,
  });
}

/** 5. Query a Payment Order */
async function queryPaymentOrder({ merchantOrderId }) {
  const params = { merchantId: CONFIG.merchantId, merchantOrderId };
  const sign = buildSign(params, CONFIG.secretKey);
  return postJson("/api/order/api/order/queryWithdrawalOrder", {
    ...cleanParams(params),
    sign,
  });
}

// ------------------------- SEQUENTIAL EXAMPLE RUN -------------------------
// Calls each API one at a time (awaiting each before starting the next),
// logging results as it goes. Comment out any block you don't need.
async function main() {
  try {
    console.log("1) Checking balance...");
    const balance = await getBalance();
    console.log(balance);

    console.log("\n2) Creating a collection (deposit) order...");
    const collectionOrderId = `DEP-${Date.now()}`;
    const created = await createCollectionOrder({
      merchantOrderId: collectionOrderId,
      transAmt: "490",
      payType: 1, // nagad
      payerKey: "customer-123",
      payerName: "John Doe",
      ip: "8.222.136.172",
      // orderRemark omitted entirely — empty values should not be sent
    });
    console.log(created); // data = hosted payment page URL

    // console.log("\n3) Querying that collection order...");
    // const collectionStatus = await queryCollectionOrder({
    //   merchantOrderId: collectionOrderId,
    // });
    // console.log(collectionStatus);

    // console.log("\n4) Creating a payment (withdrawal) order...");
    // const withdrawalOrderId = `WD-${Date.now()}`;
    // const withdrawal = await createPaymentOrder({
    //   merchantOrderId: withdrawalOrderId,
    //   account: "01735426749",
    //   transAmt: "100",
    //   // ip: "151.246.1.39",
    //   name: "Jane Doe",
    //   payType: 2, // nagad
    //   remark: "payout",
    // });
    // console.log(withdrawal);

    // console.log("\n5) Querying that payment order...");
    // const withdrawalStatus = await queryPaymentOrder({
    //   merchantOrderId: withdrawalOrderId,
    // });
    // console.log(withdrawalStatus);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
