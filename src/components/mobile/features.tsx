import React from "react";

import bonus_100 from "@/../public/assets/images/features/mobile/bonus-100.png";
import bonus_50 from "@/../public/assets/images/features/mobile/bonus-50.png";
import bonus_series from "@/../public/assets/images/features/mobile/series-bonus.png";
import sports_cashback from "@/../public/assets/images/features/mobile/sports-cashback.png";
import vip_cashback from "@/../public/assets/images/features/mobile/vip-cashback.png";
import welcome_pac from "@/../public/assets/images/features/mobile/welcome-pac.png";
import Image from "next/image";
import Link from "next/link";

const featuresData = [
  {
    image: bonus_100,
    name: "100% First Deposit bonus",
    link: "#",
  },
  {
    image: welcome_pac,
    name: "Welcome package +150",
    link: "#",
  },
  {
    image: sports_cashback,
    name: "Sports cashback",
    link: "#",
  },
  {
    image: bonus_50,
    name: "50% Bonus on sports",
    link: "#",
  },
  {
    image: vip_cashback,
    name: "VIP cashback",
    link: "#",
  },
  {
    image: bonus_series,
    name: "Bonus for a Series",
    link: "#",
  },
];

const Feartures = () => {
  return (
    <div className="flex items-start hide-scrollbar gap-2.5 overflow-x-auto flex-nowrap mt-2 mb-4 ">
      {featuresData.map((feature, i) => (
        <Link
          href={feature.link}
          key={i}
          className="flex flex-col gap-2 min-w-20  h-[115px] justify-between"
        >
          <Image
            placeholder="blur"
            src={feature.image}
            alt={feature.name}
            className=" aspect-square rounded-3xl object-cover"
          />
          <p className="text-[10px] text-black line-clamp-2 text-center leading-[10px] p-1">
            {feature.name}
          </p>
        </Link>
      ))}
    </div>
  );
};

export default Feartures;
