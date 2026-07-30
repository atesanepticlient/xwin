"use client";
import React from "react";
import {
  MdOutlineAttachMoney,
  MdOutlinePerson,
  MdOutlineSportsSoccer,
  MdOutlinePowerSettingsNew,
} from "react-icons/md";
import AccountMenuItem from "./account/AccountMenuItem";

const SettingsMenu = () => {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-2 shadow-sm">
        <ul className="divide-y divide-gray-50">
          <AccountMenuItem
            label="My accounts"
            href="/account/my-accounts"
            icon={<MdOutlineAttachMoney className="w-5 h-5" />}
          />
          <AccountMenuItem
            label="Account"
            href="/account/settings-account"
            icon={<MdOutlinePerson className="w-5 h-5" />}
          />
          <AccountMenuItem
            label="My sports"
            href="/account/my-sports"
            icon={<MdOutlineSportsSoccer className="w-5 h-5" />}
          />
        </ul>
      </div>

      <div className="bg-white rounded-xl p-2 shadow-sm">
        <ul>
          <AccountMenuItem
            label="Log out on all devices"
            href="/account/logout-all"
            icon={<MdOutlinePowerSettingsNew className="w-5 h-5" />}
          />
        </ul>
      </div>
    </div>
  );
};

export default SettingsMenu;
