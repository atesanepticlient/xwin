"use client";
import Link from "next/link";
import React from "react";

// import btn_mobila from "@/../public/assets/images/btn-mobile-app.svg";
// import logo from "@/../public/assets/svg/logo2.svg";
// import Image from "next/image";

import { BsTelegram } from "react-icons/bs";
import { FaFacebookF } from "react-icons/fa6";
// import SupportLine from "../SupportLine";
import { MdOutlineEmail } from "react-icons/md";
import { AiOutlineLogin } from "react-icons/ai";
import { useFetchContactQuery } from "@/lib/features/contactApiSlice";
const Contact = () => {
  const { data, isLoading } = useFetchContactQuery();

  return (
    <div>
      <span className="text-xs md:text-sm block text-center py-4 text-[#c1d5e3] px-3">
        About us Terms and Conditions Full Version Contacts Bitcoin Become an
        agent
      </span>
      <div className="px-3 py-3">
        <Link
          href="/register"
          className="w-full bg-[#7EC151] py-2 flex items-center justify-center gap-3 text-black text-sm rounded-lg"
        >
          <AiOutlineLogin className="w-4 h-4 " />
          Registation
        </Link>
      </div>
      {/* <div className="px-4">
        <Link
          href="#"
          className="bg-[#1A1A1A] flex items-center justify-center gap-2 my-3 "
        >
          <Image src={btn_mobila} alt="mobila app" className="w-[150px]" />
          <div className="flex flex-col gap-1">
            <Image src={logo} alt="1xbet" className="w-[60px] " />
            <span className="text-xs text-white">Mobile Application</span>
          </div>
        </Link>
      </div> */}
      {data && !isLoading && (
        <div className="px-2">
          <div className="flex justify-center items-center my-3 gap-2">
            {data.payload.telegram && (
              <Link
                href={`https://t.me/${data.payload.telegram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[rgb(51,51,51)] text-white py-3 rounded-lg"
              >
                <BsTelegram className="w-4 h-4 text-white mx-auto" />
              </Link>
            )}

            {data.payload.facebook && (
              <Link
                href={data.payload.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[rgb(51,51,51)] text-white py-3  rounded-lg"
              >
                <FaFacebookF className="w-4 h-4 text-white mx-auto" />
              </Link>
            )}

            {data.payload.email && (
              <Link
                href={`mailto:${data.payload.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#24507d] text-white py-3"
              >
                <MdOutlineEmail className="w-4 h-4 text-white mx-auto" />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* <SupportLine /> */}
    </div>
  );
};

export default Contact;
