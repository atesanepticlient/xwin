// "use client";
// import React from "react";
// import ProfileInfoItem from "./ProfileInfoItem";
// import { FaLock, FaPencilAlt } from "react-icons/fa";
// import ProfileMenuContextWapper from "./ProfileMenuContextWapper";
// import { countryNameFinder } from "@/lib/helpers";
// import moment from "moment";
// import useCurrentUser from "@/hook/useCurrentUser";
// interface ProfileInfoItemProps {
//   label: string;
//   value: string;
//   editable: boolean;
//   type?: "password" | "phone" | "name";
// }
// const ProfileInfoItemLg = ({
//   label,
//   value,
//   editable,
//   type,
// }: ProfileInfoItemProps) => {
//   return (
//     <div className="px-3 py-2 flex items-center justify-between profile-info-item">
//       <span className="text-sm text-[#212121]">{label}</span>
//       <div className="flex items-center gap-2">
//         <span className="text-sm font-semibold text-[#212121]">{value}</span>

//         {editable && (
//           <ProfileMenuContextWapper type={type!}>
//             <button disabled={!editable} className="p-1">
//               <FaPencilAlt className="w-3 h-3 text-[#212121]" />
//             </button>
//           </ProfileMenuContextWapper>
//         )}

//         {!editable && <FaLock className="w-3 h-3 text-[#212121]" />}
//       </div>
//     </div>
//   );
// };

// const ProfileInfo = () => {
//   const user = useCurrentUser();

//   return (
//     <div className="px-0 md:px-3">
//       <div className="hidden md:block bg-white px-4  py-2 my-5">
//         <div className="py-3">
//           <h4 className="text-[#212121] font-3xl font-semibold uppercase">
//             Personal profile
//           </h4>
//           <span className="text-sm font-semibold text-[#212121a9]">
//             Fill in the empty fields to take advantage of the enhanced features
//             of the website!
//           </span>
//         </div>
//         <div className="flex gap-3">
//           <div className="flex-1 profile-info">
//             <div className="bg-[#555555] px-3 py-2">
//               <span className="text-sm text-white font-semibold uppercase">
//                 Account info
//               </span>
//             </div>
//             <ProfileInfoItemLg
//               label="Account number"
//               value={user!.playerId}
//               editable={false}
//             />
//             <ProfileInfoItemLg
//               label="Password"
//               value="******"
//               editable={true}
//               type="password"
//             />
//             <ProfileInfoItemLg
//               label="Registration date"
//               value={moment(user!.createdAt).format("l")}
//               editable={false}
//             />
//             <ProfileInfoItemLg
//               label="Full Name"
//               value={user!.firstName + user!.lastName}
//               type="name"
//               editable={true}
//             />

//             <ProfileInfoItemLg
//               label="Country"
//               value={countryNameFinder(user!.wallet!.currencyCode)!}
//               editable={false}
//             />

//             <ProfileInfoItemLg
//               label="Currency"
//               value={user!.wallet!.currencyCode}
//               editable={false}
//             />
//           </div>
//           <div className="flex-1 profile-info">
//             <div className="bg-[#555555] px-3 py-2">
//               <span className="text-sm text-white font-semibold uppercase">
//                 Contact details
//               </span>
//             </div>
//             <ProfileInfoItemLg
//               label="Phone"
//               value={user!.phone}
//               editable={true}
//               type="phone"
//             />

//             <ProfileInfoItemLg
//               label="Email"
//               value={user!.email}
//               editable={false}
//             />
//           </div>
//         </div>
//       </div>

//       <div className="block md:hidden pt-2 pb-5 bg-[#fff]">
//         <ul className="flex flex-col gap-3">
//           <ProfileInfoItem label="Account Number" value={user!.playerId} />
//           <ProfileInfoItem label="Password" value="*******" />
//           <ProfileInfoItem
//             label="Registration date"
//             value={moment(user?.createdAt).calendar()}
//           />
//           <ProfileInfoItem label="Phone" value={user!.phone} />
//           <ProfileInfoItem label="Email" value={user!.email} />
//           <ProfileInfoItem label="First Name" value={user!.firstName} />
//           <ProfileInfoItem label="Surname Name" value={user!.lastName} />
//           <ProfileInfoItem
//             label="Country"
//             value={
//               countryNameFinder(user!.wallet!.currencyCode) || "Bangladesh"
//             }
//           />
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default ProfileInfo;
// components/account/profile/ProfileInfo.tsx
"use client";
import React from "react";
import { FaLock, FaPencilAlt } from "react-icons/fa";
import {
  MdOutlineNumbers,
  MdLockOutline,
  MdOutlineCalendarToday,
  MdOutlinePublic,
  MdOutlinePayments,
} from "react-icons/md";
import { HiOutlineUser } from "react-icons/hi2";
import { PiPhoneLight, PiEnvelopeLight } from "react-icons/pi";

import ProfileInfoItem from "./ProfileInfoItem";
import ProfileMenuContextWapper from "./ProfileMenuContextWapper";
import ProfileAvatarCard from "./ProfileAvatarCard";
import ProfileCompletion from "./ProfileCompletion";
import { countryNameFinder } from "@/lib/helpers";
import moment from "moment";
import useCurrentUser from "@/hook/useCurrentUser";

interface ProfileInfoItemLgProps {
  label: string;
  value: string;
  editable: boolean;
  type?: "password" | "phone" | "name";
  icon?: React.ReactNode;
}

const ProfileInfoItemLg = ({
  label,
  value,
  editable,
  type,
  icon,
}: ProfileInfoItemLgProps) => {
  return (
    <div className="px-3 py-3 flex items-center justify-between profile-info-item hover:bg-[#FAFAFA] transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <span className="text-[#8a8a8a] shrink-0">{icon}</span>}
        <span className="text-sm text-[#5c5c5c] truncate">{label}</span>
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-sm font-semibold text-[#212121]">{value}</span>

        {editable && (
          <ProfileMenuContextWapper type={type!}>
            <button
              disabled={!editable}
              className="w-6 h-6 flex items-center justify-center rounded-md bg-[#F5F5F5] hover:bg-[#1FC16B]/10 hover:text-[#1FC16B] transition-colors"
            >
              <FaPencilAlt className="w-3 h-3" />
            </button>
          </ProfileMenuContextWapper>
        )}

        {!editable && (
          <span className="w-6 h-6 flex items-center justify-center rounded-md bg-[#F5F5F5] text-[#a0a0a0]">
            <FaLock className="w-3 h-3" />
          </span>
        )}
      </div>
    </div>
  );
};

const ProfileInfo = () => {
  const user = useCurrentUser();

  return (
    <div className="px-0 md:px-3">
      {/* Desktop */}
      <div className="hidden md:block">
        <div className="bg-white px-4 py-4 mb-3 rounded-md">
          <h4 className="text-[#212121] text-xl font-bold">Personal profile</h4>
          <span className="text-sm text-[#8a8a8a]">
            Fill in the empty fields to unlock the full features of your
            account.
          </span>
        </div>

        <ProfileAvatarCard />
        <div className="h-3" />
        <ProfileCompletion />

        <div className="flex gap-3 mt-2">
          <div className="flex-1 bg-white rounded-md overflow-hidden divide-y divide-[#F0F0F0]">
            <div className="bg-[#212121] px-4 py-2.5">
              <span className="text-xs text-white font-semibold tracking-wide uppercase">
                Account info
              </span>
            </div>
            <ProfileInfoItemLg
              label="Account number"
              value={user!.playerId}
              editable={false}
              icon={<MdOutlineNumbers className="w-4 h-4" />}
            />
            <ProfileInfoItemLg
              label="Password"
              value="••••••••"
              editable={true}
              type="password"
              icon={<MdLockOutline className="w-4 h-4" />}
            />
            <ProfileInfoItemLg
              label="Registration date"
              value={moment(user!.createdAt).format("l")}
              editable={false}
              icon={<MdOutlineCalendarToday className="w-4 h-4" />}
            />
            <ProfileInfoItemLg
              label="Full name"
              value={user!.firstName + " " + user!.lastName}
              type="name"
              editable={true}
              icon={<HiOutlineUser className="w-4 h-4" />}
            />
            <ProfileInfoItemLg
              label="Country"
              value={countryNameFinder(user!.wallet!.currencyCode)!}
              editable={false}
              icon={<MdOutlinePublic className="w-4 h-4" />}
            />
            <ProfileInfoItemLg
              label="Currency"
              value={user!.wallet!.currencyCode}
              editable={false}
              icon={<MdOutlinePayments className="w-4 h-4" />}
            />
          </div>

          <div className="flex-1 bg-white rounded-md overflow-hidden divide-y divide-[#F0F0F0] h-fit">
            <div className="bg-[#212121] px-4 py-2.5">
              <span className="text-xs text-white font-semibold tracking-wide uppercase">
                Contact details
              </span>
            </div>
            <ProfileInfoItemLg
              label="Phone"
              value={user!.phone}
              editable={true}
              type="phone"
              icon={<PiPhoneLight className="w-4 h-4" />}
            />
            <ProfileInfoItemLg
              label="Email"
              value={user!.email}
              editable={false}
              icon={<PiEnvelopeLight className="w-4 h-4" />}
            />
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="block md:hidden space-y-2">
        <ProfileAvatarCard />
        <ProfileCompletion />

        <div className="bg-white rounded-md px-2 divide-y divide-[#F0F0F0]">
          <p className="text-[11px] font-semibold tracking-wide text-[#a0a0a0] px-1 pt-3 pb-1 uppercase">
            Account
          </p>
          <ProfileInfoItem
            label="Account number"
            value={user!.playerId}
            icon={<MdOutlineNumbers className="w-4 h-4" />}
          />
          <ProfileInfoItem
            label="Password"
            value="••••••••"
            icon={<MdLockOutline className="w-4 h-4" />}
          />
          <ProfileInfoItem
            label="Registration date"
            value={moment(user?.createdAt).calendar()}
            icon={<MdOutlineCalendarToday className="w-4 h-4" />}
          />
        </div>

        <div className="bg-white rounded-md px-2 divide-y divide-[#F0F0F0]">
          <p className="text-[11px] font-semibold tracking-wide text-[#a0a0a0] px-1 pt-3 pb-1 uppercase">
            Contact
          </p>
          <ProfileInfoItem
            label="Phone"
            value={user!.phone}
            icon={<PiPhoneLight className="w-4 h-4" />}
            verified={!!user?.phone}
          />
          <ProfileInfoItem
            label="Email"
            value={user!.email}
            icon={<PiEnvelopeLight className="w-4 h-4" />}
            verified={!!user?.email}
          />
        </div>

        <div className="bg-white rounded-md px-2 divide-y divide-[#F0F0F0]">
          <p className="text-[11px] font-semibold tracking-wide text-[#a0a0a0] px-1 pt-3 pb-1 uppercase">
            Personal
          </p>
          <ProfileInfoItem
            label="First name"
            value={user!.firstName}
            icon={<HiOutlineUser className="w-4 h-4" />}
          />
          <ProfileInfoItem
            label="Surname"
            value={user!.lastName}
            icon={<HiOutlineUser className="w-4 h-4" />}
          />
          <ProfileInfoItem
            label="Country"
            value={
              countryNameFinder(user!.wallet!.currencyCode) || "Bangladesh"
            }
            icon={<MdOutlinePublic className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;
