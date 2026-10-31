import { NextRequest } from "next/server";
import { handlePkPayout } from "@/lib/payment/daypay/pk/callbacks";

// Gateway notify_url for PK withdrawals. Must be listed in publicRoutes (routes.ts).
export const POST = (req: NextRequest) => handlePkPayout(req);
