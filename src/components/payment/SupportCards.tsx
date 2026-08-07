import React from "react";

export default function SupportCards() {
  return (
    <div className=" px-3 flex flex-col gap-3 mt-3 mx-auto justify-center">
      {/* Top Card - Bengali Support Message */}
      <div className="bg-[#cdcdcd] rounded-sm p-1.5 text-gray-800 shadow-sm border border-gray-300/50">
        <p className="text-xs sm:text-sm font-[450]">
          If you have any problems with deposits, withdrawals and accounts
          please contact support
        </p>
        <a
          href="https://t.me/WinpariBet_Support"
          className="inline-block mt-1 text-xs sm:text-sm text-[#1B6BB0] hover:underline font-medium"
          target="_blank"
        >
          Contact Support
        </a>
      </div>

      {/* Bottom Card - Agent Recruitment Info */}
      <div className="bg-[#cdcdcd] font-[450] rounded-sm p-1.5 text-gray-800 shadow-sm border border-gray-300/50 text-xs sm:text-sm ">
        <p className="mb-0.5">
          Become an Agent and earn with WinpariBet, Here you can earn a lot of
          money.{" "}
          <a href="https://www.winparibetagent.com/" className="text-[#1B6BB0]">
            Join now
          </a>{" "}
        </p>

        {/* <p>
          Visit for more information:{" "}
          <a href="#" className="text-[#1B6BB0] hover:underline">
            Become a Bank Transfer Agent
          </a>
        </p> */}
      </div>
    </div>
  );
}
