import Image from "next/image";
import React from "react";

import agent from "@/../public/assets/images/features/agent.png";
import cashback from "@/../public/assets/images/features/cash-back.png";
import mobileApps from "@/../public/assets/images/features/mobile-apps.png";
import depositWithdraw from "@/../public/assets/images/features/deposit-withdraw.png";
import Link from "next/link";

const FeaturesHighlight = () => {
  const features = [
    {
      name: "Get weekly cashback!",
      redirect: "#",
      image: cashback,
    },
    {
      name: "First deposit and withdrawl",
      redirect: "/account/deposit",
      image: depositWithdraw,
    },
    {
      name: "Mobile app for andriod and IOS",
      redirect: "",
      image: mobileApps,
    },
    {
      name: "Become an agent",
      redirect: "",
      image: agent,
    },
  ];

  return (
    <div className="px-2 py-1.5 flex flex-nowrap overflow-x-auto  hide-scrollbar gap-1.5  w-full md:hidden">
      {features.map((f, i) => (
        <Link
        href={f.redirect}
          className="rounded-md bg-white p-1.5  w-[110px] min-w-[110px] shadow "
          key={i}
        >
          <Image
            alt={f.name}
            src={f.image}
            className="w-full aspect-square rounded-md"
          />

          <div className="pt-1.5 px-2">
            <p className="text-center text-black text-xs line-clamp-2">
              {f.name}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default FeaturesHighlight;
