// lib/secure-data.ts
import crypto from "crypto";

const SECRET_KEY = process.env.BONUS_SIGNING_SECRET!; // set this in .env, never expose to client

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(input: string) {
  input = input.replace(/-/g, "+").replace(/_/g, "/");
  while (input.length % 4) input += "=";
  return Buffer.from(input, "base64").toString("utf8");
}

function sign(payload: string) {
  return base64url(
    crypto.createHmac("sha256", SECRET_KEY).update(payload).digest(),
  );
}

// ---------------------------------------------------------------
// Server-side: encode data + signature into a single string to send
// to the client (e.g. as a prop, or in a server action response).
// ---------------------------------------------------------------
export function encodeData<T extends object>(data: T): string {
  const payload = base64url(JSON.stringify(data));
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

// ---------------------------------------------------------------
// Server-side: verify + decode a token the client sends back.
// Throws if the token was tampered with or malformed.
// ---------------------------------------------------------------
export function decodeData<T = any>(token: string): T {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    throw new Error("Malformed token");
  }

  const expectedSignature = sign(payload);

  // timing-safe comparison to avoid signature-guessing attacks
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (
    sigBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(sigBuf, expectedBuf)
  ) {
    throw new Error("Invalid signature - data was tampered with");
  }

  return JSON.parse(base64urlDecode(payload)) as T;
}
