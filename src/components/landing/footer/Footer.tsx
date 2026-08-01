"use client";
import React from "react";
import Image from "next/image";

import visa_master_card from "@/../public/assets/images/visa_mastercard.png";
import gcb from "@/../public/assets/svg/gcb-logo--green.svg";
import SiteContent from "../content/SiteContent";
import About from "../about/About";
// import Sponsors from "../sponsors/Sponsors";
// import Contact from "../contact/Contact";
import { MdOutlineSupportAgent } from "react-icons/md";
import PrimaryButton from "@/components/buttons/primary-button";
const Footer = () => {
  return (
    <div className="">
      {/* <Sponsors /> */}
      <div className="bg-[#212121] px-4">
        {/* <Contact /> */}
        <SiteContent />
        <About />
        <div className="mt-6 md:mt-8  px-5 md:px-8 py-6 md:py-8 shadow-sm">
          <div className="flex justify-center py-4 lg:py-6">
            <a href="https://agent.winparibet.com/signup" target="blank">
              <PrimaryButton className="flex items-center gap-1">
                Become an agent
                <MdOutlineSupportAgent className="w-4 h-4 lg:w-5 lg:h-5" />{" "}
              </PrimaryButton>
            </a>
          </div>
          <p className="text-[10px] md:text-xs text-muted mt-2 md:mt-3 w-[95%] md:w-[70%] mx-auto text-center">
            To register, users must accept the Terms of Service. If updated,
            users may discontinue services before changes take effect, at least
            two weeks after the announcement. While translations may be
            available, the English version prevails. winparibet.com is operated
            by Caecus N.V., registered in Curaçao (163779) and licensed under
            OGL/2024/1262/0493 as of 07/11/2024. Payments are processed by
            Exidna Enterprises LTD (НЕ435756) and Kassifoni Enterprises LTD
            (НЕ435760). Users must also accept the Responsible Gaming Agreement
            (RGA) and its Gaming Terms of Service (GT&C), which include
            important restrictions for protection. Please review them carefully
            before playing.
          </p>

          <div className="my-3 md:my-4 pb-12  flex flex-col justify-center">
            <div>
              <div className="w-6 h-6 md:w-8 md:h-8 mx-auto rounded-full flex justify-center items-center text-white text-sm border-2 border-white">
                18+
              </div>
              <Image
                src={visa_master_card}
                alt="visa and master card"
                className="w-[100px] md:w-[120px] mx-auto"
              />
            </div>
            <Image
              src={gcb}
              alt="gcb"
              className="w-[130px] md:w-[140px] mx-auto mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
