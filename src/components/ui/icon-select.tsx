"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export type IconSelectOption = {
  value: string;
  label: string;
  subLabel?: string; // e.g. "(Singapore dollar)" or "First deposit bonus up to 129 SGD"
  icon?: React.ReactNode; // flag circle / sport icon
};

type Props = {
  placeholder: string;
  options: IconSelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

// Generic version of the rows in images 1/2/4: icon on the left,
// a muted placeholder + bold selected label, chevron on the right.
const IconSelect = ({
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: Props) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 border border-border rounded-md px-4 py-3 bg-white disabled:opacity-60"
      >
        {selected?.icon && (
          <span className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0">
            {selected.icon}
          </span>
        )}
        <span className="flex-1 text-left">
          <span className="block text-xs text-[#8a8a8a]">{placeholder}</span>
          <span className="block text-[#3b3b3b] leading-tight">
            {selected ? (
              <>
                {selected.label}{" "}
                {selected.subLabel && (
                  <span className="text-[#8a8a8a]">{selected.subLabel}</span>
                )}
              </>
            ) : (
              <span className="text-[#8a8a8a]">Select</span>
            )}
          </span>
        </span>
        <ChevronDown className="w-5 h-5 text-[#3b3b3b]" />
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-md border border-border bg-white shadow-lg">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#f5f5f5] text-left"
            >
              {opt.icon && (
                <span className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                  {opt.icon}
                </span>
              )}
              <span>
                <span className="block text-[#3b3b3b]">{opt.label}</span>
                {opt.subLabel && (
                  <span className="block text-xs text-[#8a8a8a]">
                    {opt.subLabel}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default IconSelect;
