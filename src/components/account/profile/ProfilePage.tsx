// components/account/profile/ProfilePage.tsx
"use client";
import ProfileInfo from "@/components/account/profile/ProfileInfo";
import ProfileUpdate from "@/components/account/profile/ProfileUpdate";
import ProfileUpdateButton from "@/components/account/profile/ProfileUpdateButton";

import PageHeader from "@/components/PageHeader";
import { useUpdatePageNavigation } from "@/store/useStore";
import React from "react";

const ProfilePage = () => {
  const page = useUpdatePageNavigation((state) => state.page);

  return (
    <div className="min-h-screen bg-[#F0F0F0] pb-20">
      <PageHeader label="Personal profile" />

      <main className="pt-2 px-2 md:px-0">
        {page !== "update" ? (
          <>
            <ProfileInfo />
            <ProfileUpdateButton />
          </>
        ) : (
          <div className="px-0 md:px-3">
            <ProfileUpdate />
          </div>
        )}
      </main>
    </div>
  );
};

export default ProfilePage;
