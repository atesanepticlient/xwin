import { bdRoutes } from "@/lib/payment/daypay/bd";
import { toRouteExports } from "@/lib/payment/daypay/common/routes";

const handlers = toRouteExports(bdRoutes.deposit);
export const GET = handlers.GET;
export const POST = handlers.POST;
