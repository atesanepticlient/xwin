import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const SecondaryButton: React.FC<ButtonProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      className={`bg-[#4f4f4fe5] text-white md:px-4 md:py-2 px-2 py-1 font-medium hover:bg-[#4F4F4F] transition-colors cursor-pointer text-sm rounded-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
