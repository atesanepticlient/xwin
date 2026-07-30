// Trim/extend this list to whatever countries & currencies you support.
// flag is just a unicode emoji rendered inside the circular icon slot -
// swap for real flag images if you have them.
export const COUNTRIES = [
  // { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", currency: "BDT" },
  // { code: "MY", name: "Malaysia", flag: "🇲🇾", currency: "MYR" },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR" },
  { code: "IN", name: "Pakistain", flag: "🇵🇰", currency: "PRK" },
  // { code: "PH", name: "Philippines", flag: "🇵🇭", currency: "PHP" },
  // { code: "ID", name: "Indonesia", flag: "🇮🇩", currency: "IDR" },
];
export const PHONE_COUNTRIES = [
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dialCode: "+880" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dialCode: "+92" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
];

export const CURRENCIES = [
  { code: "SGD", name: "Singapore dollar" },
  { code: "BDT", name: "Bangladeshi taka" },
  { code: "MYR", name: "Malaysian ringgit" },
  { code: "INR", name: "Indian rupee" },
  { code: "PHP", name: "Philippine peso" },
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "IDR", name: "Indonesian rupiah" },
  { code: "PRK", name: "Pakistaini rupee" },
];

// "Bonus for sports" style options. Amount would normally come from
// your `site` table (referBonuseMainUser) - passed in as a prop below
// so this stays server-config-driven rather than hardcoded.
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
