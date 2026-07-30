import AuthHeaderAndHolder from "@/components/auth/auth-header-and-holder";
import LoginForm from "@/components/auth/LoginForm";
import Header from "@/components/landing/headers/Header";
import TabBar from "@/components/landing/TabBar";
import React, { Suspense } from "react";

const LoginPage = () => {
  return (
    <Suspense>
      <div className="bg-slate-50 w-full">
        <Header />
        <AuthHeaderAndHolder title="LOGIN">
          <LoginForm />
        </AuthHeaderAndHolder>
        <TabBar />
      </div>
    </Suspense>
  );
};

export default LoginPage;
