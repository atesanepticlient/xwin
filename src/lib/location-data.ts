// Supported countries with correct ISO codes and flags
export const COUNTRIES = [
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", currency: "BDT" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", currency: "PKR" },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR" },
];

export const PHONE_COUNTRIES = [
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dialCode: "+880" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
];

// Currencies strictly for supported countries
export const CURRENCIES = [
  { code: "BDT", name: "Bangladeshi taka" },
  { code: "PKR", name: "Pakistani rupee" },
  { code: "INR", name: "Indian rupee" },
];

// Helper to auto-bind currency strictly to country selection
export const buildBonusOptions = (
  firstDepositBonus: number,
  currencyCode: string,
) => [
  {
    value: "sports",
    label: "Bonus for sports",
    subLabel: `First deposit bonus up to ${firstDepositBonus.toFixed(2)} ${currencyCode}`,
  },
  {
    value: "none",
    label: "No bonus",
    subLabel: "Skip the welcome bonus",
  },
];
