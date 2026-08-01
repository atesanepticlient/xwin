"use client";
import { useFetchContactQuery } from "@/lib/features/contactApiSlice";
import Link from "next/link";
import React from "react";

const SiteContentTitle = ({ title }: { title: string }) => {
  return (
    <h4 className="text-sm md:text-balance font-medium text-white uppercase relative">
      {title}{" "}
      <div className="absolute left-0 -bottom-2 w-5 h-1 bg-[#A5CF83]"></div>
    </h4>
  );
};

const SiteContent = () => {
  const { data } = useFetchContactQuery();
  const email = data?.payload?.email;
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-8 mt-6 md:mt-8   px-5 md:px-8 py-6 md:py-8 shadow-sm">
      <div>
        <SiteContentTitle title="WinpariBet" />

        <ul className="flex flex-col mt-4 md:mt-6">
          <li>
            <Link
              href="/about-us"
              className="text-[#d3e0f0] text-xs md:text-sm content-link font-normal"
            >
              About us
            </Link>
          </li>
          <li>
            <Link
              href="/register"
              className="text-[#d3e0f0] text-xs md:text-sm content-link font-normal"
            >
              Registration
            </Link>
          </li>
          <li>
            <a
              href="https://agent.livvbet.com/signup"
              className="text-[#d3e0f0] text-xs md:text-sm content-link font-normal"
            >
              Become an Agent
            </a>
          </li>
          <li>
            <Link
              href="/affiliate"
              className="text-[#d3e0f0] text-xs md:text-sm content-link font-normal"
            >
              Affiliate
            </Link>
          </li>
          <li>
            <Link
              href="/account/profile"
              className="text-[#d3e0f0] text-xs md:text-sm content-link font-normal"
            >
              Profile
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <SiteContentTitle title="Games" />

        <ul className="flex flex-col mt-4 md:mt-6">
          <li>
            <Link
              href="/casino"
              className="text-[#d3e0f0] text-xs md:text-sm content-link font-normal"
            >
              Casino Games
            </Link>
          </li>
          <li>
            <Link
              href="/casino/slot"
              className="text-[#d3e0f0] text-xs md:text-sm content-link font-normal"
            >
              Slot Games
            </Link>
          </li>
          <li>
            <Link
              href="/live"
              className="text-[#d3e0f0] text-xs md:text-sm content-link font-normal"
            >
              Live
            </Link>
          </li>
          <li>
            <Link
              href="/sports"
              className="text-[#d3e0f0] text-xs md:text-sm content-link font-normal"
            >
              Cricket
            </Link>
          </li>
          <li>
            <Link
              href="/sports"
              className="text-[#d3e0f0] text-xs md:text-sm content-link font-normal"
            >
              Football
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <SiteContentTitle title="Support" />

        <ul className="flex flex-col mt-4 md:mt-6">
          <li>
            <a
              target="_blank"
              href={`mailto:${email}`}
              rel="noreferrer"
              className="text-[#d3e0f0] text-xs md:text-sm content-link font-normal"
            >
              Contact Us
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SiteContent;
