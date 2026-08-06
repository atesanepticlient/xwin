"use client";

import AuthHeaderAndHolder from "@/components/auth/auth-header-and-holder";
import RegistationForm from "@/components/auth/RegistationForm";
import Header from "@/components/landing/headers/Header";
import TabBar from "@/components/landing/TabBar";
import { useAppStore } from "@/lib/store.zustond";
import React from "react";

const RegisterPage = async () => {
  const { isMobileSubdomain } = useAppStore();
  return (
    <div className="bg-slate-50 w-full  ">
      <Header />
      <AuthHeaderAndHolder title="REGISTRATION">
        <RegistationForm initialCountry={"BD"} />
      </AuthHeaderAndHolder>

      {!isMobileSubdomain && <TabBar />}
    </div>
  );
};

export default RegisterPage;
