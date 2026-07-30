"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaQuestion } from "react-icons/fa";
import SecondaryButton from "./buttons/secondary-button";
import { ScaleLoader } from "react-spinners";
import FlipText from "./FlipText";

interface LogoutModalProps {
  children?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
  onLogout?: () => Promise<void> | void;
}

const LogoutModal = ({
  children,
  isOpen,
  onClose,
  onLogout,
}: LogoutModalProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();

  // Support both controlled (isOpen) and uncontrolled modes
  const isModalOpen = isOpen !== undefined ? isOpen : internalOpen;

  const handleClose = () => {
    if (onClose) onClose();
    setInternalOpen(false);
  };

  return (
    <>
      {children && (
        <div onClick={() => setInternalOpen(true)} className="cursor-pointer">
          {children}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={handleClose}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-fit">
          <DialogHeader className="hidden">
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>

          <LogoutModalContent onClose={handleClose} onLogout={onLogout} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogoutModal;

/* Content component */
export const LogoutModalContent = ({
  onClose,
  onLogout,
}: {
  onClose: () => void;
  onLogout?: () => Promise<void> | void;
}) => {
  const [pending, startTransition] = useTransition();

  const handleConfirmLogout = () => {
    startTransition(async () => {
      try {
        if (onLogout) {
          await onLogout();
        }
        onClose();
      } catch (error) {
        console.error("Logout error:", error);
      }
    });
  };

  return (
    <div className="bg-white p-4 lg:p-6 w-[270px] lg:w-[330px] rounded-2xl shadow-xl">
      <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full flex justify-center items-center mx-auto border-2 border-[#E8E8E8]">
        <FaQuestion className="w-8 h-8 text-yellow-400" />
      </div>

      <div className="text-center mt-6 mb-6">
        <p className="font-bold text-lg lg:text-xl text-[rgb(59,59,59)]">
          Confirm action
        </p>
        <span className="text-sm font-normal text-[rgb(59,59,59)]">
          Are you sure you want to log out on all devices?
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <SecondaryButton
          onClick={handleConfirmLogout}
          disabled={pending}
          className="flex-1 !bg-[#212121] text-white"
        >
          {pending ? <FlipText text="Logout..." className="text-xs"/> : "Logout"}
        </SecondaryButton>

        <SecondaryButton
          type="button"
          onClick={onClose}
          disabled={pending}
          className="flex-1 bg-[#DFDFDF] hover:bg-gray-300 !text-black border-none"
        >
          Cancel
        </SecondaryButton>
      </div>
    </div>
  );
};
