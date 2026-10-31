import { NextRequest } from "next/server";
import { rootGet, rootPost } from "@/lib/payment/root";

// ROOT: picks the country (account currency, IP as fallback) and forwards
// to /api/payment/<country>/deposit or /api/payment/crypto/deposit.
export const GET = (req: NextRequest) => rootGet(req, "deposit");
export const POST = (req: NextRequest) => rootPost(req, "deposit");
