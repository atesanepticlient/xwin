/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import { FaInbox } from "react-icons/fa";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteMessagesMutation,
  useFetchMessagesQuery,
  useSeenMessagesMutation,
} from "@/lib/features/messageApiSlice";
import { IoIosArrowDown } from "react-icons/io";
import moment from "moment";
import { IoCheckbox, IoCheckboxOutline } from "react-icons/io5";
import { AiFillDelete } from "react-icons/ai";
import SecondaryButton from "@/components/buttons/secondary-button";
import SweetToast from "@/components/ui/SweetToast";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { ScaleLoader } from "react-spinners";
import { Prisma } from "@prisma/client";
import { useMarkNotificationsAsSeenMutation } from "@/lib/features/notificatinApiSlice";

const Inbox = () => {
  const { data, isLoading } = useFetchMessagesQuery();
  const messages = data?.payload;

  if (!data || isLoading) {
    return <Skeleton className="bg-[#303030] rounded-sm w-[35px] h-[30px]" />;
  }

  const unsee = messages?.find((message) => message.seen == false);

  return (
    <Popover>
      <PopoverTrigger>
        <button className="relative bg-[#1a1a1a] hover:bg-[#303030] text-white hidden md:flex items-center gap-1 py-2 px-2 rounded-sm">
          <FaInbox className="w-4 h-4" /> <IoIosArrowDown className="w-4 h-4" />
          {unsee && (
            <div className="absolute top-1 left-4 w-2 h-2 rounded-full bg-[#FFB805]"></div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px]  bg-white rounded-lg p-3 z-[1000]">
        {messages && <MessageBox messages={messages} />}
      </PopoverContent>
    </Popover>
  );
};

export default Inbox;

export const MessageBox = ({
  messages,
}: {
  messages: Prisma.MessageGetPayload<object>[];
}) => {
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);

  const [deleteApi, { isLoading: deleteLoading }] = useDeleteMessagesMutation();

  const [updateStatus] = useMarkNotificationsAsSeenMutation();

  const handleSelect = (id: string) => {
    setSelectedMessages((state) => {
      let newState = state;
      const isExit = state.includes(id);
      if (isExit) {
        newState = newState.filter((state) => id !== state);
      } else {
        newState = [...newState, id];
      }
      return newState;
    });
  };

  const handleDeleteMessages = () => {
    deleteApi({ messagesId: selectedMessages })
      .unwrap()
      .then((res) => {
        // handle success delete
      })
      .catch((error: any) => {
        if (error.data.message) {
          SweetToast.fire({
            icon: "error",
            title: error.data.message,
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          SweetToast.fire({
            icon: "error",
            title: INTERNAL_SERVER_ERROR,
            showConfirmButton: false,
            timer: 2000,
          });
        }
      });
  };

  useEffect(() => {
    updateStatus({ proccessQueue: ["MESSAGE"] });
  }, []);

  return (
    <div className=" ">
      {messages?.length == 0 && (
        <div className="w-full rounded-md bg-white shadow-[0px_10px_10px_-10px_rgba(33,35,38,0.01)] h-[120px]  flex justify-center items-center text-sm font-normal text-[#212121]">
          You have no messages at the moment
        </div>
      )}

      {messages!.length > 0 && (
        <div className="overflow-y-auto max-h-[250px]">
          <ul className="flex flex-col gap-1">
            {messages?.map((message, i) => (
              <li key={i} className="  border-b border-b-[#F2F2F2]">
                <button
                  onClick={() => handleSelect(message.id)}
                  className="w-full p-1 rounded-sm flex justify-between items-center hover:bg-[#F2F2F2] hover:transition-colors"
                >
                  <div>
                    <span className="text-sm block text-start font-medium text-[#1A1A1A]">
                      {message.title}
                    </span>
                    <p className="text-xs text-start max-w-[97%] line-clamp-2 font-normal text-[#9A9A9A]">
                      {message.description}
                    </p>
                    <p className="text-xs text-start font-medium text-[#9A9A9A]">
                      {moment(message.createdAt).calendar()}
                    </p>
                  </div>
                  <div>
                    {selectedMessages?.includes(message.id) ? (
                      <IoCheckbox className="w-5 h-5 text-[#1A1A1A]" />
                    ) : (
                      <IoCheckboxOutline className="w-5 h-5 text-[#1A1A1A]" />
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <div className="bg-white sticky left-0 bottom-0 ">
            <SecondaryButton
              disabled={selectedMessages.length == 0}
              onClick={handleDeleteMessages}
              className="flex items-center disabled:opacity-50 justify-center gap-2 w-full mt-3"
            >
              {deleteLoading ? (
                <ScaleLoader color="#fff" cssOverride={{ scale: 0.4 }} />
              ) : (
                <>
                  <AiFillDelete className="w-4 h-4" /> Clear
                </>
              )}
            </SecondaryButton>
          </div>
        </div>
      )}
    </div>
  );
};
