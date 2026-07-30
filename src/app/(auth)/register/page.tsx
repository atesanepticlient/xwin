import AuthHeaderAndHolder from "@/components/auth/auth-header-and-holder";
import RegistationForm from "@/components/auth/RegistationForm";
import Header from "@/components/landing/headers/Header";
import TabBar from "@/components/landing/TabBar";
import { getCountryFromHeaders } from "@/lib/get-country";
import React from "react";

const RegisterPage = async () => {
  const detectedCountry = await getCountryFromHeaders();
  return (
    <div className="bg-slate-50 w-full  ">
      <Header />
      <AuthHeaderAndHolder title="REGISTRATION">
        <RegistationForm initialCountry={detectedCountry} />
      </AuthHeaderAndHolder>

      <TabBar />
    </div>
  );
};

export default RegisterPage;
