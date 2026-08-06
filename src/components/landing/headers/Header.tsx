"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect } from "react";

import logo from "@/../public/assets/images/logo.png";

import { FaGift } from "react-icons/fa";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { IoMdArrowDropdown } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { cn } from "@/lib/utils";
import AuthModal from "@/components/auth/AuthModal";
import Login from "@/components/auth/Login";
import Registation from "@/components/auth/Registation";
import useCurrentUser from "@/hook/useCurrentUser";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthButtons from "@/components/auth/AuthButtons";
import PrimaryButton from "@/components/buttons/primary-button";
import SecondaryButton from "@/components/buttons/secondary-button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import Balance from "./balance";
import Inbox from "./inbox";
import User from "./user";
import Logout from "./logout";
import LogoutModal from "@/components/LogoutModal";
import { signOut } from "next-auth/react";
import Contact from "./contact";
import CountryFlag from "./country-flag";
import { useNotificationStore } from "@/store/useStore";
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility";

const Header = () => {
  const user = useCurrentUser();
  const visible = useHeaderVisibility();

  const handleLogout = async () => {
    await signOut({ redirect: false });

    window.location.href = "/";
  };

  const { notifications, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const hasUnseenNotifications = Boolean(
    notifications?.unSeenMessage ||
    notifications?.claimableCashback ||
    notifications?.depositNofication ||
    notifications?.withdrawalNofication ||
    notifications?.profileStatus ||
    notifications?.scurityStatus,
  );

  return (
    <header
      className={cn(
        "w-full z-[1000] sticky top-0 left-0 flex flex-col items-center justify-between transition-transform duration-300 ease-in-out",
        visible ? "translate-y-0" : "-translate-y-full",
      )}
    >
      <TooltipProvider>
        <div className="w-full bg-[#292929] px-5 md:px-7 lg:px-8 py-4 hidden md:flex items-center justify-between ">
          <div className="flex items-center gap-4 md:gap-5 lg:gap-7  ">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/invite-friend">
                  <button className="bg-[#4F4F4F] hover:bg-[#474747] cursor-pointer text-white p-1 rounded-md text-sm flex items-center gap-2 font-medium">
                    <FaGift className="w-4 h-4" /> 12000BDT
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bonus</p>
              </TooltipContent>
            </Tooltip>

            <Contact />
          </div>

          <div className="flex items-center gap-2 ">
            {user && (
              <>
                <Balance />
                <Inbox />
                <User />
                <LogoutModal onLogout={handleLogout}>
                  <Logout />
                </LogoutModal>
              </>
            )}

            {!user && (
              <AuthModal
                trigger={
                  <SecondaryButton className="!py-1 !font-medium">
                    Login
                  </SecondaryButton>
                }
              >
                <Login />
              </AuthModal>
            )}
            {!user && (
              <AuthModal
                trigger={
                  <PrimaryButton className="!py-1 !font-medium">
                    Registration
                  </PrimaryButton>
                }
              >
                <Registation />
              </AuthModal>
            )}
          </div>
        </div>
      </TooltipProvider>

      <div className="w-full bg-[#212121] border-t-[2px] border-t-[#4f4f4f36] px-2 md:px-7 lg:px-8 py-2 flex items-center justify-between md:py-2 px-2 md:px-4 ">
        <div className="relative flex items-center gap-2">
          <Link href="/">
            <Image
              src={logo}
              alt="WinpariBet"
              placeholder="blur"
              className="w-[110px] md:w-[120px] lg:w-[140px] "
            />
          </Link>

          <CountryFlag country={user?.country!} />
        </div>

        <nav className="hidden md:block py-1 bg-[#90B800]">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>
                Top-Events <IoMdArrowDropdown className={cn("w-4 h-4 ")} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  <Link href="/sports">EPL</Link>
                </MenubarItem>
                <MenubarItem>
                  <Link href="/sports">LaLiga</Link>
                </MenubarItem>
                <MenubarItem>
                  <Link href="/sports">IPL</Link>
                </MenubarItem>
                <MenubarSeparator />
              </MenubarContent>
            </MenubarMenu>

            <Link className="text-black/75 hover:text-black" href="/live">
              Live
            </Link>

            <MenubarMenu>
              <MenubarTrigger>
                SPORTS <IoMdArrowDropdown className={cn("w-4 h-4 ")} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  <Link href="/sports">Cricket</Link>
                </MenubarItem>
                <MenubarItem>
                  <Link href="/sports">Soccer</Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>
                Casino <IoMdArrowDropdown className={cn("w-4 h-4 ")} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  <Link href="/casino">SLOT</Link>
                </MenubarItem>
                <MenubarItem>
                  <Link href="/casino">POPULAR</Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>
                Esports <IoMdArrowDropdown className={cn("w-4 h-4 ")} />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem>
                  <Link href="/sports">Live</Link>
                </MenubarItem>
                <MenubarItem>
                  <Link href="/sports">Pre Match</Link>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </nav>

        <div className="flex md:hidden items-center justify-end  py-2 md:py-3 ">
          <div className="">
            <AuthButtons />
          </div>
          {user && (
            <div className="flex items-center gap-2">
              <Balance />
              <Link
                href="/account"
                className="relative bg-[#3a3a3a] hover:bg-[#4f4f4f] w-7 flex items-center justify-center aspect-square rounded-sm"
              >
                <FaUser className="w-4 h-4 !text-white rounded-md" />

                {hasUnseenNotifications && (
                  <span className="absolute top-1 right-0.5 flex h-1.5 w-1.5 bg-yellow-500 rounded-full"></span>
                )}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
