import { NextRequest } from "next/server";
import { handleBdPayout } from "@/lib/payment/daypay/bd/callbacks";

// Gateway notify_url for BD withdrawals (GET). Must be listed in publicRoutes (routes.ts).
export const GET = (req: NextRequest) => handleBdPayout(req);
