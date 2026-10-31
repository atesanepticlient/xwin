import { NextRequest } from "next/server";
import { handlePkPayin } from "@/lib/payment/daypay/pk/callbacks";

// Gateway notify_url for PK deposits. Must be listed in publicRoutes (routes.ts).
export const POST = (req: NextRequest) => handlePkPayin(req);
