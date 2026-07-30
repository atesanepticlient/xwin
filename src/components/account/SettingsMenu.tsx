"use client";
import React from "react";
import {
  MdOutlineAttachMoney,
  MdOutlinePerson,
  MdOutlinePowerSettingsNew,
} from "react-icons/md";
import AccountMenuItem from "./AccountMenuItem";
import { logoutAllDevices } from "@/action/logout";
import LogoutModal from "../LogoutModal";

const SettingsMenu = () => {
  const handleLogoutFromAllDevices = async () => {
    const res = await logoutAllDevices();

    if (res?.success) {
      console.log("redirecting .....")
      window.location.href = "/login";
    }
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl p-2 shadow-sm">
        <ul className="divide-y divide-gray-50">
          <AccountMenuItem
            label="My accounts"
            href="/account/profile"
            icon={<MdOutlineAttachMoney className="w-5 h-5" />}
          />
          <AccountMenuItem
            label="Account"
            href="/account/profile"
            icon={<MdOutlinePerson className="w-5 h-5" />}
          />
          {/* <AccountMenuItem
            label="My sports"
            href="/account/my-sports"
            icon={<MdOutlineSportsSoccer className="w-5 h-5" />}
          /> */}
        </ul>
      </div>

      <div className="bg-white rounded-xl p-2 shadow-sm">
        <LogoutModal onLogout={async () => await handleLogoutFromAllDevices()}>
          <ul>
            <AccountMenuItem
              label="Log out on all devices"
              icon={<MdOutlinePowerSettingsNew className="w-5 h-5" />}
            />
          </ul>
        </LogoutModal>
      </div>
    </div>
  );
};

export default SettingsMenu;
