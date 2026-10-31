import type { PaymentProvider, ProviderKey } from "../types";
import { beidouProvider } from "./beidou";
import { pkDemoProvider } from "./pk-demo";

const PROVIDERS: Record<ProviderKey, PaymentProvider> = {
  beidou: beidouProvider,
  "pk-demo": pkDemoProvider,
};

export const getProvider = (key: ProviderKey): PaymentProvider => PROVIDERS[key];
