"use client";
import { useFetchPaymentDataQuery } from "@/lib/features/paymentApiSlice";
import { usePaymentMethods } from "@/store/useStore";
import React, { useEffect } from "react";
import { ScaleLoader } from "react-spinners";

const PaymentWapper = ({
  type,
  children,
}: {
  type: "withdraw" | "deposit";
  children: React.ReactNode;
}) => {
  const { data, isLoading } = useFetchPaymentDataQuery({type});
  const methods =
    type === "withdraw" ? data?.payload?.withdraw : data?.payload?.deposit;
  const { setAllMethods, setType } = usePaymentMethods((state) => state);

  useEffect(() => {
    if (methods && Array.isArray(methods)) {
      setType(type);
      setAllMethods(methods);
    }
  }, [methods, type, setAllMethods, setType]);

  return (
    <div className="min-h-[50vh] ">
      {isLoading && (
        <div className="w-full h-[50vh] flex items-center justify-center">
          <ScaleLoader color="#212121" />
        </div>
      )}
      {!isLoading && data && <>{children}</>}
    </div>
  );
};

export default PaymentWapper;
