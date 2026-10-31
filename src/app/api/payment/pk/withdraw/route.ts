import { pkRoutes } from "@/lib/payment/daypay/pk";
import { toRouteExports } from "@/lib/payment/daypay/common/routes";

const handlers = toRouteExports(pkRoutes.withdraw);
export const GET = handlers.GET;
export const POST = handlers.POST;
