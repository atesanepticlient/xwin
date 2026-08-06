"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";

const PageHeader = ({
  title,
  rightAction,
}: {
  title: string;
  rightAction?: React.ReactNode;
}) => {
  const router = useRouter();
  return (
    <header className="top-0 left-0 sticky z-40 flex px-2 items-center justify-between bg-[#2b2b2b] md:hidden h-[55px]">
      <div className="flex items-center gap-2">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer text-white bg-[#4f4f4f]"
          onClick={() => router.back()}
        >
          <FaArrowLeftLong />
        </button>

        <h2 className="text-base font-bold  max-w-[80%] line-clamp-1">
          {title}
        </h2>
      </div>

      {rightAction && rightAction}
    </header>
  );
};

export default PageHeader;
