// components/account/profile/ProfileMenuContextWapper.tsx
import React from "react";
import PasswordChange from "./PasswordChange";
import NameChange from "./NameChange";
import NumberChange from "./NumberChange";
import EmailChange from "./EmailChange";

const ProfileMenuContextWapper = ({
  type,
  children,
}: {
  type: "password" | "phone" | "name" | "email";
  children: React.ReactNode;
}) => {
  if (type == "password") {
    return <PasswordChange>{children}</PasswordChange>;
  } else if (type == "name") {
    return <NameChange>{children}</NameChange>;
  } else if (type == "phone") {
    return <NumberChange>{children}</NumberChange>;
  } else if (type == "email") {
    return <EmailChange>{children}</EmailChange>;
  }
  return <>{children}</>;
};

export default ProfileMenuContextWapper;
