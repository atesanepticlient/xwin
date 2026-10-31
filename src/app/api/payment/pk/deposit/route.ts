import { pkRoutes } from "@/lib/payment/registry";
import { toRouteExports } from "@/lib/payment/routes";

const handlers = toRouteExports(pkRoutes.deposit);
export const GET = handlers.GET;
export const POST = handlers.POST;
