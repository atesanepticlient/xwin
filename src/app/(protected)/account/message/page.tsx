"use client";
import { MessageBox } from "@/components/landing/headers/inbox";
import TextPreloader from "@/components/logo-preloader";
import PageHeader from "@/components/page-header";
import { useFetchMessagesQuery } from "@/lib/features/messageApiSlice";
import React from "react";

const Messages = () => {
  const { data, isLoading } = useFetchMessagesQuery();
  const messages = data?.payload;

  return (
    <div className=" bg-[#F2F2F2] w-full min-h-screen h-screen">
      {data && !isLoading && messages && (
        <main>
          <PageHeader title="Messages" />

          <div className="w-full p-2">
            {messages && <MessageBox messages={messages} />}
          </div>
        </main>
      )}

      {isLoading && (
        <div className="flex justify-center items-center w-full h-full">
          <TextPreloader size={3} />
        </div>
      )}
    </div>
  );
};

export default Messages;
