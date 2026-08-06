import Link from "next/link";
import React from "react";
import { FaHockeyPuck, FaTableTennis, FaVolleyballBall } from "react-icons/fa";
import { GiCommercialAirplane } from "react-icons/gi";
import { IoIosWallet } from "react-icons/io";
import {
  IoBaseball,
  IoFootballSharp,
  IoGameController,
  IoTennisball,
} from "react-icons/io5";
import { MdSportsBasketball, MdSportsCricket } from "react-icons/md";
import { PiSlidersHorizontalFill } from "react-icons/pi";

const categories = [
  {
    icon: IoIosWallet,
    link: "/",
    lable: "All",
  },
  {
    icon: IoFootballSharp,
    link: "/sports?redirect=live/football",
    lable: "Football",
  },
  {
    icon: IoTennisball,
    link: "/sports?redirect=live/tennis",
    lable: "Tennis",
  },
  {
    icon: MdSportsBasketball,
    link: "/sports?redirect=live/basketball",
    lable: "Basketball",
  },
  {
    icon: FaHockeyPuck,
    link: "/sports?redirect=live/ice-hockey",
    lable: "Ice Hockey",
  },
  {
    icon: FaVolleyballBall,
    link: "/sports?redirect=live/volleyball",
    lable: "Volleyball",
  },
  {
    icon: FaTableTennis,
    link: "/sports?redirect=live/table-tennis",
    lable: "Table Tennis",
  },
  {
    icon: IoBaseball,
    link: "/sports?redirect=live/baseball",
    lable: "Baseball",
  },
  {
    icon: IoGameController,
    link: "/sports?redirect=live/esports",
    lable: "Esports",
  },
  {
    icon: MdSportsCricket,
    link: "/sports?redirect=live/cricket",
    lable: "Cricket",
  },
  {
    icon: PiSlidersHorizontalFill,
    link: "/sports/redirect=live",
    lable: "Filter",
  },
];
const Category = () => {
  return (
    <div className="flex items-start gap-2 overflow-auto max-w-full hide-scrollbar ">
      {categories.map((category, i) => {
        const Icon = category.icon;
        return (
          <Link
            href={category.link}
            key={i}
            className="bg-white p-2 min-w-max rounded-2xl flex justify-center flex-col gap-1"
          >
            <Icon className="text-[#242424] w-[22px] h-[22px] mx-auto" />
            <span className="block text-center text-[10px] font-medium text-[#242424]">
              {category.lable}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default Category;
