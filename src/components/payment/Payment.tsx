import React from "react";
import PaymentMethods from "./PaymentMethods";
import PaymentMethodNav from "./PaymentMenuNav";

const Payment = () => {
  return (
    <div className="py-2  grid grid-cols-1 md:grid-cols-[20%,_80%] gap-3 ">
      <PaymentMethodNav />
      <PaymentMethods />
    </div>
  );
};

export default Payment;
