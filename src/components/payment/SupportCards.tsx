import React from "react";

export default function SupportCards() {
  return (
    <div className=" px-3 flex flex-col gap-3 mt-3 mx-auto justify-center">
      {/* Top Card - Bengali Support Message */}
      <div className="bg-[#cdcdcd] rounded-sm p-1.5 text-gray-800 shadow-sm border border-gray-300/50">
        <p className="text-sm sm:text-base font-medium">
          আপনার যদি ডিপোজিট এবং উইথড্র করতে সমস্যা হয় তবে সাপোর্ট এর সাথে
          যোগাযোগ করুন
        </p>
        <a
          href="#"
          className="inline-block mt-1 text-xs sm:text-sm text-[#1B6BB0] hover:underline font-medium"
        >
          সাপোর্টের নির্দেশাবলী
        </a>
      </div>

      {/* Bottom Card - Agent Recruitment Info */}
      <div className="bg-[#cdcdcd] rounded-sm p-1.5 text-gray-800 shadow-sm border border-gray-300/50 text-xs sm:text-sm font-medium">
        <p className="mb-0.5">Become an Agent and earn with Xparibet!</p>

        <p className="mb-0.5">
          Become a MobCash Agent:{" "}
          <a
            href="https://t.me/RZI313"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1B6BB0] hover:underline"
          >
            @RZI313{" "}
          </a>
        </p>

        <p className="mb-0.5">
          Become a Bank Transfer Agent:{" "}
          <a
            href="https://t.me/RZI313"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1B6BB0] hover:underline"
          >
            @RZI313
          </a>
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
