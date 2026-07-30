import bd from "@/../public/assets/svg/bd.svg";
import ind from "@/../public/assets/svg/india.svg";
import pak from "@/../public/assets/svg/pakistan.svg";
import Image, { StaticImageData } from "next/image";

const flagMap: Record<string, { src: StaticImageData; alt: string }> = {
  BD: { src: bd, alt: "Bangladesh" },
  IN: { src: ind, alt: "India" },
  PK: { src: pak, alt: "Pakistan" },
};

const CountryFlag = ({ country }: { country?: string }) => {
  const resolvedCountry = country?.toUpperCase() ?? "BD";
  const flag = flagMap[resolvedCountry] ?? flagMap.BD;
  return (
    <div>
      <Image src={flag.src} alt={flag.alt} className="w-6 h-6" />
    </div>
  );
};

export default CountryFlag;
