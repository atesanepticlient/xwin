"use client";
import React from "react";
import {
  MdAlternateEmail,
  MdOutlineLocalOffer,
  MdOutlineAttachMoney,
  MdOutlineDiamond,
  MdOutlineCardGiftcard,
} from "react-icons/md";
import AccountMenuItem from "./AccountMenuItem";

const PromoMenu = () => {
  return (
    <div className="bg-white rounded-xl p-2 shadow-sm">
      <ul className="divide-y divide-gray-50">
       
        <AccountMenuItem
          label="Promo code check"
          href="/account/promo-check"
          icon={<MdOutlineLocalOffer className="w-5 h-5" />}
        />
        <AccountMenuItem
          label="Cashback"
          href="/account/cashback"
          icon={<MdOutlineAttachMoney className="w-5 h-5" />}
        />
       
        <AccountMenuItem
          label="Pay-in Bonuses"
          href="/account/payin-bonuses"
          icon={<MdOutlineCardGiftcard className="w-5 h-5" />}
        />
      </ul>
    </div>
  );
};

export default PromoMenu;
