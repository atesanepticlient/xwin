// node prisma/seed-payment-countries.js   (safe to run many times)
// ESM version: your package.json has "type": "module".
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const COUNTRIES = [
  { code: "BD", name: "Bangladesh", currencyCode: "BDT" },
  { code: "PK", name: "Pakistan", currencyCode: "PKR" },
  { code: "IN", name: "India", currencyCode: "INR" },
];

try {
  for (const c of COUNTRIES) {
    await db.paymentCountry.upsert({
      where: { code: c.code },
      update: { name: c.name, currencyCode: c.currencyCode },
      create: c,
    });
  }
  console.log(
    "PaymentCountry seeded:",
    COUNTRIES.map((c) => c.code).join(", "),
  );
} catch (e) {
  console.error(e);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
