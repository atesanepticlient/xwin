"use client";
import React, { useEffect } from "react";
import {
  MdOutlineLocalOffer,
  MdOutlineAttachMoney,
  MdOutlineCardGiftcard,
} from "react-icons/md";
import AccountMenuItem from "./AccountMenuItem";
import { useNotificationStore } from "@/store/useStore";

const PromoMenu = () => {
  const { notifications, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

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
          badge={Boolean(notifications?.claimableCashback)}
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
