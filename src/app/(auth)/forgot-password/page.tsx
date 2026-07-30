import FormLoader from "@/components/auth/FormLoader";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import React, { Suspense } from "react";
import Header from "@/components/landing/headers/Header";
import AuthHeaderAndHolder from "@/components/auth/auth-header-and-holder";
import TabBar from "@/components/landing/TabBar";

const ForgotPasswordPage = () => {
  return (
    <Suspense>
      <div className="bg-slate-50 w-full h-screen">
        <Header />
        <AuthHeaderAndHolder title="Reset Password">
          <ForgotPasswordForm />
        </AuthHeaderAndHolder>
        <TabBar />
      </div>
    </Suspense>
  );
};

export default ForgotPasswordPage;
