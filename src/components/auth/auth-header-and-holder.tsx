"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import PageHeader from "../page-header";

const AuthHeaderAndHolder = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => {
  const router = useRouter();
  return (
    <div className="">
      <PageHeader title={title} />

      <div className="py-4 lg:py-8 px-2">{children}</div>
    </div>
  );
};

export default AuthHeaderAndHolder;
