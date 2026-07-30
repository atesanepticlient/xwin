/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import crypto, { createHash } from "crypto";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const nDArrayMaker = <T>(array: Array<any>, n: number) => {
  const nDArray: T[][] = [];
  while (array.length !== 0) {
    const oneDArray = array.splice(0, n);
    nDArray.push(oneDArray);
  }

  return nDArray;
};

export function generateCode(length: number = 6): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

export const getTailwindBreakpoint = () => {
  const width = window.innerWidth;

  if (width < 640) return "sm"; // <640px
  if (width < 768) return "md"; // 640px - 767px
  if (width < 1024) return "lg"; // 768px - 1023px
  if (width < 1280) return "xl"; // 1024px - 1279px
  if (width < 1536) return "2xl"; // 1280px - 1535px
  return "3xl+"; // 1536px and above (if you added custom breakpoints)
};

export function generateTrxId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let trxid = "";
  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    trxid += chars[randomIndex];
  }
  return trxid;
}

export function generateSignature(
  accessKey: string,
  privateKey: string,
  transactions: any,
): string {
  // Create JSON string with unescaped slashes and unicode
  const json = JSON.stringify(transactions);

  // Create MD5 hash of the JSON
  const md5Hash = crypto.createHash("md5").update(json).digest("hex");

  // Concatenate accessKey + privateKey + md5Hash
  const combined = accessKey + privateKey + md5Hash;

  // Create final SHA1 signature
  const sha1Signature = crypto
    .createHash("sha1")
    .update(combined)
    .digest("hex");

  return sha1Signature;
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num);
}

export function generateGSCPlatformSignature(
  requestTime: string,
  secretKey: string,
  operatorCode: string,
  key: string,
): string {
  const signatureString = `${operatorCode}${requestTime}${key}${secretKey}`;
  return createHash("md5").update(signatureString).digest("hex");
}

export function generateOtp(length = 5) {
  const max = Math.pow(10, length);
  const min = Math.pow(10, length - 1);
  return crypto.randomInt(min, max).toString();
}

export const accpectedCurrency = ["BDT", "IDR", "IDR2"];

export function replaceDomain(url: string, newDomain: string) {
  const parsed = new URL(url);
  parsed.hostname = newDomain;
  return parsed.toString();
}
