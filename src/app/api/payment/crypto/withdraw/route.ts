import { cryptoRoutes, toRouteExports } from "@/lib/payment/routes";

const handlers = toRouteExports(cryptoRoutes.withdraw);
export const GET = handlers.GET;
export const POST = handlers.POST;
