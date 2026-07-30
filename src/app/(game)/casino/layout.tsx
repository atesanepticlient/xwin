import React from "react";

import PageHeader from "@/components/page-header";
import { SearchButton } from "../search-game";

const SlotsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <div className="min-h-screen  ">
        <main className=" ">
          <PageHeader title="CASINO" rightAction={<SearchButton />} />
          <div className="">
           
            <div className=" flex items-start">
              <div className="hidden md:block md:w-[35%] ">
                {/* <FilterCasino /> */}
              </div>
              <div className="p-2.5 md:p-3 lg:p-5 w-full  casino">
                <div className="flex items-center justify-between">
                  {/* <SearchGame />
                <FilterOpenButton /> */}
                </div>
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SlotsLayout;
