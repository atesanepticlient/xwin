"use client";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import React, { Suspense } from "react";
import Header from "@/components/landing/headers/Header";
import AuthHeaderAndHolder from "@/components/auth/auth-header-and-holder";
import TabBar from "@/components/landing/TabBar";
import { useAppStore } from "@/lib/store.zustond";

const ForgotPasswordPage = () => {
  const { isMobileSubdomain } = useAppStore();
  return (
    <Suspense>
      <div className="bg-slate-50 w-full h-screen">
        <Header />
        <AuthHeaderAndHolder title="Reset Password">
          <ForgotPasswordForm />
        </AuthHeaderAndHolder>
        {!isMobileSubdomain && <TabBar />}
      </div>
    </Suspense>
  );
};

export default ForgotPasswordPage;
