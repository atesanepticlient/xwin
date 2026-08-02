"use client";

import bd from "@/../public/assets/svg/bd.svg";
import ind from "@/../public/assets/svg/india.svg";
import pak from "@/../public/assets/svg/pakistan.svg";
import useCountryCode from "@/hooks/useCountryCode";
import Image, { StaticImageData } from "next/image";
import { useEffect, useState } from "react";

const flagMap: Record<string, { src: StaticImageData; alt: string }> = {
  BD: { src: bd, alt: "Bangladesh" },
  IN: { src: ind, alt: "India" },
  PK: { src: pak, alt: "Pakistan" },
};

const CountryFlag = ({ country }: { country?: string }) => {
  const [countryCode, setCountryCode] = useState("");

  const { countryCode: countryCodeAuto } = useCountryCode();

  useEffect(() => {
    if (country) {
      setCountryCode(country.toUpperCase());
    } else if (countryCodeAuto) {
      setCountryCode(countryCodeAuto?.toUpperCase());
    }
  }, [country, countryCodeAuto]);

  const flag = flagMap[countryCode] ?? flagMap.BD;

  return (
    <div>
      {!countryCode && (
        <div className="bg-[#4f4f4f] w-6 aspect-square rounded-full"></div>
      )}
      {countryCode && (
        <Image src={flag.src} alt={flag.alt} className="w-6 h-6" />
      )}
    </div>
  );
};

export default CountryFlag;
