"use client";
import { usePaymentMethods } from "@/store/useStore";
import React from "react";
import PaymentWalletCard from "./PaymentWalletCard";
import { DepostisMethods, WithdrawMethods } from "@/types/api";

interface PaymentMethodsTypesProps {
  method: WithdrawMethods | DepostisMethods;
}
const PaymentMethodsTypes = ({ method }: PaymentMethodsTypesProps) => {
  return (
    <div className="bg-[#D0E1D0] p-2 md:p-4 px-3 lg:px-2">
      <h4 className="text-[#336633] text-sm md:text-base mb-1 uppercase">
        {method.methodName}
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {method.wallets.map((w, i) => (
          <PaymentWalletCard key={i} wallet={w} />
        ))}
      </div>
    </div>
  );
};

const PaymentMethodsC = () => {
  const { methods, allMethods } = usePaymentMethods((state) => state);

  return (
    <div className="flex flex-col gap-2 md:gap-4 ">
      {methods.length == 0 &&
        allMethods.map((m, i) => <PaymentMethodsTypes key={i} method={m} />)}

      {methods.length !== 0 &&
        methods.map((m, i) => <PaymentMethodsTypes key={i} method={m} />)}
    </div>
  );
};

export default PaymentMethodsC;
