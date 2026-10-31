import { cryptoRoutes } from "@/lib/payment/daypay/crypto";
import { toRouteExports } from "@/lib/payment/daypay/common/routes";

const handlers = toRouteExports(cryptoRoutes.deposit);
export const GET = handlers.GET;
export const POST = handlers.POST;
