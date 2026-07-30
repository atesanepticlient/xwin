import SecurityCard from "@/components/account/security/SecurityCard";
import SecurityProgress from "@/components/account/security/SecurityProgress";
import React from "react";
import { FaUnlockAlt } from "react-icons/fa";
import { BsPhoneFill } from "react-icons/bs";
import { FaQuestion } from "react-icons/fa6";
import { MdOutlineEmail } from "react-icons/md";
import PageHeader from "@/components/page-header";
const SceurityPage = () => {
  return (
    <div className="bg-[#D0DAE1] ">
      <main>
        <PageHeader title="account security" />
        <div className="px-2 md:px-4 md:py-5">
          <div className="py-3 ">
            <h4 className="text-secondary-foreground font-3xl font-semibold uppercase">
              Personal profile
            </h4>
            <span className="text-sm font-semibold text-secondary-foreground">
              Fill in the empty fields to take advantage of the enhanced
              features of the website!
            </span>
          </div>
          <SecurityProgress progress={70} />
          <div className="grid grid-cols-1 md:grid-cols-2 p-1 md:p-2 gap-2 md:gap-4">
            <SecurityCard
              lable="Change password
"
              des="Change your password every 3 months
"
              icon={
                <FaUnlockAlt className="w-8 h-8 md:w-10 md:h-10 mx-auto text-accent" />
              }
              enable
            />
            <SecurityCard
              lable="Link your phone
"
              des="This will enable you to restore access to your account
"
              icon={
                <BsPhoneFill className="w-8 h-8 md:w-10 md:h-10 mx-auto text-accent" />
              }
              enable={false}
            />

            <SecurityCard
              lable="Security question
"
              des="Security question added successfully

"
              icon={
                <FaQuestion className="w-8 h-8 md:w-10 md:h-10 mx-auto text-accent" />
              }
              enable
            />

            <SecurityCard
              lable="Email login disabled
"
              des="This is the most insecure way to log in

"
              icon={
                <MdOutlineEmail className="w-8 h-8 md:w-10 md:h-10 mx-auto text-accent" />
              }
              enable
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default SceurityPage;
