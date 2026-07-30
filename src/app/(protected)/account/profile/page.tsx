"use client";
import ProfileInfo from "@/components/account/profile/ProfileInfo";
import ProfileUpdate from "@/components/account/profile/ProfileUpdate";
import ProfileUpdateButton from "@/components/account/profile/ProfileUpdateButton";
import PageHeader from "@/components/page-header";

import { useUpdatePageNavigation } from "@/store/useStore";
import React from "react";

const ProfilePage = () => {
  const page = useUpdatePageNavigation((state) => state.page);
  return (
    <div className="bg-gray-200 ">
      {page !== "update" && (
        <main>
          <PageHeader title="Personal profile" />
          <div className="px-2 pt-3 pb-4">
            <ProfileInfo />
            <ProfileUpdateButton />
          </div>
        </main>
      )}

      {page == "update" && (
        <main>
          <PageHeader title="personal profile" />
          <div className="px-4 py-4 ">
            <ProfileUpdate />
          </div>
        </main>
      )}
    </div>
  );
};

export default ProfilePage;
