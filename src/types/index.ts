import { z } from "zod";

export const BonusTypeEnum = z.enum(["FIRST_PAYIN", "NO_BONUS"]);

export type BonusType = z.infer<typeof BonusTypeEnum>;
