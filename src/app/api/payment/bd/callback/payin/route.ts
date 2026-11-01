import { NextRequest } from "next/server";
import { handleBdPayin } from "@/lib/payment/daypay/bd/callbacks";

// Gateway notifyurl for BD deposits (GET). Must be listed in publicRoutes (routes.ts).
export const GET = (req: NextRequest) => handleBdPayin(req);
