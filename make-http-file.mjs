#!/usr/bin/env node
/**
 * Writes callbacks.http for the free "REST Client" VS Code extension
 * (publisher: Huachao Mao). Same 12 SIGNED callback requests as the Thunder
 * Client collection, no import, no paid plan. Secrets come from your .env.
 *
 *   node make-http-file.mjs \
 *     --bd-deposit=BDD...  --bd-withdraw=BDW... \
 *     --pk-deposit=PKD...  --pk-withdraw=PKW... \
 *     [--amount=500] [--base=http://localhost:3000]
 *
 * Then open callbacks.http in VS Code and click "Send Request" above a request.
 * Order ids = merchantId of PENDING rows in your deposit / withdraw tables.
 * Each order settles once, and a signature only fits its own order id:
 * create a new pending order and run this again to re-test.
 * Env: BDPAY_PARTNER, BDPAY_SECRET_KEY, PKPAY_MERCHANT_ID, PKPAY_SECRET_KEY.
 */
import crypto from "node:crypto";
import fs from "node:fs";

try { process.loadEnvFile(".env"); } catch { /* use the shell env */ }

const opt = Object.fromEntries(
  process.argv.slice(2).filter((a) => a.startsWith("--")).map((a) => { const [k, ...v] = a.slice(2).split("="); return [k, v.join("=")]; }),
);
const base = (opt.base ?? "http://localhost:3000").replace(/\/+$/, "");
const amount = Number(opt.amount ?? 500);
const md5 = (s) => crypto.createHash("md5").update(s, "utf8").digest("hex");
const env = (n) => process.env[n] ?? "";
const bdOn = opt["bd-deposit"] || opt["bd-withdraw"];
const pkOn = opt["pk-deposit"] || opt["pk-withdraw"];
if (!bdOn && !pkOn) { console.error("Give at least one of --bd-deposit --bd-withdraw --pk-deposit --pk-withdraw"); process.exit(1); }
if (bdOn && (!env("BDPAY_PARTNER") || !env("BDPAY_SECRET_KEY"))) { console.error("Missing BDPAY_PARTNER / BDPAY_SECRET_KEY"); process.exit(1); }
if (pkOn && (!env("PKPAY_MERCHANT_ID") || !env("PKPAY_SECRET_KEY"))) { console.error("Missing PKPAY_MERCHANT_ID / PKPAY_SECRET_KEY"); process.exit(1); }

const blocks = [];

/* ---------- BD: GET + query, md5 lowercase ---------- */
function bdReq(name, flow, orderid, opstate, badSign = false) {
  const q = { parter: env("BDPAY_PARTNER"), orderid, opstate, ovalue: String(amount) };
  const sign = badSign ? "0".repeat(32)
    : md5(`opstate=${q.opstate}&orderid=${q.orderid}&ovalue=${q.ovalue}&parter=${q.parter}&key=${env("BDPAY_SECRET_KEY")}`);
  const all = { ...q, sign, ...(flow === "payout" ? { info: opstate === "0" ? "failed reason" : "" } : {}) };
  blocks.push(`### ${name}\nGET ${base}/api/payment/bd/callback/${flow}?${new URLSearchParams(all)}\n`);
}
if (bdOn) {
  if (opt["bd-deposit"]) {
    bdReq("BD deposit PAID (opstate=1) -> credits wallet", "payin", opt["bd-deposit"], "1");
    bdReq("BD deposit UNPAID (opstate=0) -> ignored", "payin", opt["bd-deposit"], "0");
  }
  if (opt["bd-withdraw"]) {
    bdReq("BD withdraw COMPLETED (opstate=1) -> ACCEPTED", "payout", opt["bd-withdraw"], "1");
    bdReq("BD withdraw FAILED (opstate=0) -> refund", "payout", opt["bd-withdraw"], "0");
  }
  bdReq("BD BAD SIGNATURE -> 400 fail", "payin", opt["bd-deposit"] || "BDDbadsign", "1", true);
}

/* ---------- PK: POST JSON, md5 UPPERCASE ---------- */
const pkSign = (p) => md5(Object.keys(p).filter((k) => k !== "sign" && k !== "ext_info" && p[k] !== "" && p[k] != null).sort().map((k) => `${k}=${p[k]}`).join("&") + `&key=${env("PKPAY_SECRET_KEY")}`).toUpperCase();
function pkReq(name, flow, orderNo, status, badSign = false) {
  const paid = (flow === "payin" && status === 3) || (flow === "payout" && status === 2);
  const body = {
    merchant_id: env("PKPAY_MERCHANT_ID"), country: "PK", timestamp: Math.floor(Date.now() / 1000),
    order_amount: amount, actual_amount: paid ? amount : 0, fee: 0, out_trade_no: orderNo,
    order_no: (flow === "payin" ? "PI" : "PO") + Date.now(), status,
    [flow === "payin" ? "pay_time" : "complete_time"]: new Date().toISOString().slice(0, 19).replace("T", " "), comment: "",
  };
  body.sign = badSign ? "0".repeat(32) : pkSign(body);
  blocks.push(`### ${name}\nPOST ${base}/api/payment/pk/callback/${flow}\nContent-Type: application/json\n\n${JSON.stringify(body, null, 2)}\n`);
}
if (pkOn) {
  const d = opt["pk-deposit"], w = opt["pk-withdraw"];
  if (d) {
    pkReq("PK deposit SUCCESS (status 3) -> credits wallet", "payin", d, 3);
    pkReq("PK deposit FAILED (status 4) -> REJECTED", "payin", d, 4);
    pkReq("PK deposit PROCESSING (status 1) -> ignored", "payin", d, 1);
  }
  if (w) {
    pkReq("PK withdraw SUCCESS (status 2) -> ACCEPTED", "payout", w, 2);
    pkReq("PK withdraw FAILED (status 3) -> refund", "payout", w, 3);
    pkReq("PK withdraw PROCESSING (status 1) -> ignored", "payout", w, 1);
  }
  pkReq("PK BAD SIGNATURE -> 400", "payin", d || "PKDbadsign", 3, true);
}

const header = `# Signed payment callbacks. Click "Send Request" above a ### block.\n# Expected: 200 "success" for valid ones, 400 for BAD SIGNATURE, 404 for unknown order.\n# Contains signed requests: do not commit or share this file.\n\n`;
fs.writeFileSync("callbacks.http", header + blocks.join("\n"));
console.log(`Wrote callbacks.http with ${blocks.length} requests.`);
