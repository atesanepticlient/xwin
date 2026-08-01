"use client";
import React from "react";
import { FaFacebookF, FaYoutube, FaTelegramPlane } from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { useFetchContactQuery } from "@/lib/features/contactApiSlice";
import { Skeleton } from "@/components/ui/skeleton";
const Contact = () => {
  const { data, isLoading } = useFetchContactQuery();

  const contact = data?.payload;

  return (
    <div className="flex items-center gap-2">
      {data && !isLoading && (
        <>
          {contact?.facebook && (
            <a
              href={contact?.facebook}
              className="p-1.5 rounded-full bg-[#468432] hover:bg-[#3c7529]"
            >
              <FaFacebookF className="w-3 h-3 lg:h-4 lg:w-4 text-black" />
            </a>
          )}

          {contact?.youtube && (
            <a
              href={contact?.youtube}
              className="p-1.5 rounded-full bg-[#468432] hover:bg-[#3c7529]"
            >
              <FaYoutube className="w-3 h-3 lg:h-4 lg:w-4 text-black" />
            </a>
          )}

          {contact?.telegram && (
            <a
              href={contact?.telegram}
              className="p-1.5 rounded-full bg-[#468432] hover:bg-[#3c7529]"
            >
              <FaTelegramPlane className="w-3 h-3 lg:h-4 lg:w-4 text-black" />
            </a>
          )}

          {contact?.twitter && (
            <a
              href={contact?.twitter}
              className="p-1.5 rounded-full bg-[#468432] hover:bg-[#3c7529]"
            >
              <BsTwitterX className="w-3 h-3 lg:h-4 lg:w-4 text-black" />
            </a>
          )}
        </>
      )}

      {(!data || isLoading) && (
        <>
          <Skeleton className="w-8 h-8 rounded-full bg-[#4F4F4F] "></Skeleton>
          <Skeleton className="w-8 h-8 rounded-full bg-[#4F4F4F] "></Skeleton>
          <Skeleton className="w-8 h-8 rounded-full bg-[#4F4F4F] "></Skeleton>
          <Skeleton className="w-8 h-8 rounded-full bg-[#4F4F4F] "></Skeleton>
          <Skeleton className="w-8 h-8 rounded-full bg-[#4F4F4F] "></Skeleton>
        </>
      )}
    </div>
  );
};

export default Contact;
