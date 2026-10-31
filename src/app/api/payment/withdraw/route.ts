import { NextRequest } from "next/server";
import { rootGet, rootPost } from "@/lib/payment/root";

// ROOT: picks the country (account currency, IP as fallback) and forwards
// to /api/payment/<country>/withdraw or /api/payment/crypto/withdraw.
export const GET = (req: NextRequest) => rootGet(req, "withdraw");
export const POST = (req: NextRequest) => rootPost(req, "withdraw");
