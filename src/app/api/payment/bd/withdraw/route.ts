import { bdRoutes } from "@/lib/payment/registry";
import { toRouteExports } from "@/lib/payment/routes";

const handlers = toRouteExports(bdRoutes.withdraw);
export const GET = handlers.GET;
export const POST = handlers.POST;
