import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const PrimaryButton: React.FC<ButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={`bg-[#7EC151] text-black md:px-4 md:py-2 px-2 py-1  hover:bg-[#499A13] transition-colors cursor-pointer text-sm rounded-sm font-medium ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
