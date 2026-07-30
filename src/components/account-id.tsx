"use client";
import React from "react";
import { FiCopy } from "react-icons/fi";

const AccountId = ({ accountId }: { accountId: string }) => {
  return (
    <div onClick={() => navigator.clipboard.writeText(accountId)} className="flex items-center gap-2">
      {" "}
      <h4 className="text-[#212121] uppercase text-base md:text-xl font-bold md:font-semibold ">
        Account Id : {accountId}
      </h4>
      <button>
        <FiCopy className="text-[#063B00] w-4 h-4" />
      </button>
    </div>
  );
};

export default AccountId;
