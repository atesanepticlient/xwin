"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type PhoneCountryOption = {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
};

type Props = {
  options: PhoneCountryOption[];
  value: string; // dialCode, e.g. "+880"
  onChange: (dialCode: string) => void;
  disabled?: boolean;
};

// Matches the "Code +65" box in the screenshot: flag circle, "Code" label,
// dial code value, chevron - sits to the left of the phone number input.
const PhoneCodeSelect = ({ options, value, onChange, disabled }: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.dialCode === value) ?? options[0];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative w-[110px] flex-shrink-0" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full h-full flex items-center gap-1 border border-border rounded-md px-2 py-1.5 bg-white disabled:opacity-60"
      >
        <span className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center bg-[#f0f0f0] flex-shrink-0 text-base">
          {selected?.flag}
        </span>
        <ChevronDown className="w-4 h-4 text-[#3b3b3b] flex-shrink-0" />
        <span className="flex-1 text-left leading-tight">
          <span className="block text-[#3b3b3b] text-sm">
            {selected?.dialCode}
          </span>
        </span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-[180px] rounded-md border border-border bg-white shadow-lg">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.code}
              onClick={() => {
                onChange(opt.dialCode);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#f5f5f5] text-left"
            >
              <span className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center bg-[#f0f0f0] text-base">
                {opt.flag}
              </span>
              <span className="text-sm text-[#3b3b3b]">{opt.name}</span>
              <span className="ml-auto text-xs text-[#8a8a8a]">
                {opt.dialCode}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhoneCodeSelect;
