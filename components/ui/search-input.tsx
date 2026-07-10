"use client";

import { MagnifyingGlass } from "@phosphor-icons/react";
import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function SearchInput({ className, id = "search-input", label = "Search", placeholder = "Search cubes", ...props }: SearchInputProps) {
  return (
    <div className="w-full space-y-2">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <div className="relative">
        <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={19} weight="regular" aria-hidden="true" />
        <Input
          className={cn(
            "h-10 rounded-xl border-neutral-200 bg-white pl-10 pr-4 text-[0.95rem] text-black placeholder:text-neutral-500 focus:border-neutral-400 focus:ring-0",
            className,
          )}
          id={id}
          placeholder={placeholder}
          type="search"
          {...props}
        />
      </div>
    </div>
  );
}
