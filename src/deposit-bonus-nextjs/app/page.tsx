import DepositBonusCard from "@/components/DepositBonusCard";
import PaymentMethods from "@/components/PaymentMethods";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center gap-3 bg-[#ececec] p-5">
      <div className="w-full max-w-[620px]">
        <DepositBonusCard />
      </div>
      <div className="w-full max-w-[620px]">
        <PaymentMethods />
      </div>
    </main>
  );
}
