import React from "react";
import Image from "next/image";
import PaymentDialog from "./PaymentDialog";

interface WalletProps {
  wallet: {
    id: string;
    name: string;
    label: string;
    image: string;
    isActive: boolean;
  };
}

const PaymentWalletCard = ({ wallet }: WalletProps) => {
  return (
    <PaymentDialog wallet={wallet}>
      <div className="cursor-pointer hover:shadow-md rounded transition-shadow overflow-hidden">
        <div className="h-[65px] bg-white flex justify-center items-center relative p-2">
          <Image
            src={wallet.image}
            alt={wallet.name}
            width={90}
            height={40}
            sizes="90px"
            quality={75}
            className={`w-[90px] h-[40px] object-contain transition-all ${
              !wallet.isActive ? "grayscale opacity-50" : ""
            }`}
          />
        </div>
        <div className="bg-[#555555] text-white w-full py-1 text-center text-xs md:text-sm truncate px-1">
          {wallet.label}
        </div>
      </div>
    </PaymentDialog>
  );
};

export default PaymentWalletCard;
