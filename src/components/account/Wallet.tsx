"use client";
import React from "react";
import useCurrentUser from "@/hook/useCurrentUser";
import { claimBonus } from "@/action/bonus";
import SweetToast from "../ui/SweetToast";
import PrimaryButton from "../buttons/primary-button";

const Wallet = () => {
  const user = useCurrentUser();

  const handleTransferBonus = (bonus: number) => {
    claimBonus({ bonus }).then((res) => {
      if (res.error) {
        SweetToast.fire({
          icon: "error",
          title: res.error,
          showConfirmButton: false,
          timer: 2000,
        });
      } else if (res.success) {
        // handle success
      }
    });
  };

  return (
    <div className="  bg-[#212121]  rounded-md ">
      <div className="bg-[#2E2E2E] rounded-t-md p-3">
        <div className="text-[10px] font-normal md:text-xs ">
          <span className="text-white text-base md:text-lg font-semibold">
            {user!.firstName + user!.lastName}
          </span>
          <span className="text-white/75 uppercase block text-sm">
            P-{user!.playerId}
          </span>
        </div>
      </div>

      <div className="px-3 py-2">
        <div>
          <div className="my-1 md:my-2 flex items-center justify-between">
            <span className="font-semibold text-[#9999] text-xs md:text-sm">
              Bonus Points
            </span>
            <span className="font-semibold text-white text-sm md:text-base">
              {Number(user!.bonusWallet!.balance).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-end items-center gap-3 pt-2">
            {+user!.bonusWallet!.turnOver !== 0 &&
              +user!.bonusWallet!.balance !== 0 && (
                <span className="text-[10px] text-[#FFB805] ">
                  Bet {+user!.bonusWallet!.turnOver} to Claim
                </span>
              )}

            {+user!.bonusWallet!.balance != 0 &&
              +user!.bonusWallet!.turnOver == 0 && (
                <PrimaryButton
                  className="!py-1"
                  onClick={() =>
                    handleTransferBonus(+user!.bonusWallet!.balance)
                  }
                >
                  Claim
                </PrimaryButton>
              )}
          </div>
        </div>
        <div className="my-1 md:my-2 flex items-center justify-between">
          <span className="font-semibold text-[#9999] text-xs md:text-sm">
            Main account
          </span>
          <span className="font-semibold text-white text-sm md:text-base">
            {Number(user!.wallet!.balance).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
