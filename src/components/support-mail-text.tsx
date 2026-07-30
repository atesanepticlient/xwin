"use client";
import { useFetchContactQuery } from "@/lib/features/contactApiSlice";
import React from "react";

const SupportMailText = () => {
  const { data } = useFetchContactQuery();
  const mail = data?.payload?.email;
  return <span>{mail}</span>;
};

export default SupportMailText;
