"use client";
import React, { useEffect, useState } from "react";
import { providers } from "@/../public/data/games";
import Image from "next/image";
import { useGamesFilter } from "@/lib/store.zustond";
const Providers = () => {
  const [search, setSearch] = useState("");
  const [filteredProviders, setFilteredProviders] = useState(providers);

  const { setProvider, provider: gameProvider } = useGamesFilter(
    (state) => state,
  );

  useEffect(() => {
    setFilteredProviders(() => {
      const newState = providers.filter((provider) =>
        provider.name.toLowerCase().includes(search),
      );

      return newState;
    });
  }, [search]);

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        placeholder="Search by provider"
        className=" outline-none w-full block bg-transparent text-xs  lg:text-sm placeholder:text-[#999999] text-[#999999] font-light px-4 py-2 border-b border-b-[#30353b] placeholder:uppercase "
      />

      <div className="p-2 md:p-3 grid grid-cols-3 gap-1.5">
        {filteredProviders?.map((provider, i) => (
          <button
            key={i}
            onClick={() => setProvider(provider.slug)}
            className={`rounded-sm p-3 border-b-[5px]  hover:border-b-[#E2A508] hover:to-[#ffba0033] transition-all bg-gradient-to-b  from-[#52525215] ${
              provider.slug == gameProvider
                ? "to-[#ffba0033] border-b-[#E2A508]"
                : "to-[#ffffff1a] border-b-[#343A3D]"
            } `}
          >
            <picture style={{ filter: "invert(100%)" }}>
              <Image src={provider.image} alt={provider.name} />
            </picture>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Providers;
