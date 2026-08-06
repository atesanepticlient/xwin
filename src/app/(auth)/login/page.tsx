"use client";

import AuthHeaderAndHolder from "@/components/auth/auth-header-and-holder";
import LoginForm from "@/components/auth/LoginForm";
import Header from "@/components/landing/headers/Header";
import TabBar from "@/components/landing/TabBar";
import { useAppStore } from "@/lib/store.zustond";
import React, { Suspense } from "react";

const LoginPage = () => {
  const { isMobileSubdomain } = useAppStore();
  return (
    <Suspense>
      <div className="bg-slate-50 w-full">
        <Header />
        <AuthHeaderAndHolder title="LOGIN">
          <LoginForm />
        </AuthHeaderAndHolder>

        {!isMobileSubdomain && <TabBar />}
        
      </div>
    </Suspense>
  );
};

export default LoginPage;
