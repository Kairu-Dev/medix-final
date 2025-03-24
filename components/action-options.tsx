"use client";

import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export const ActionOptions = ({ children }: { children: React.ReactNode }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-full p-1"
        >
          <EllipsisVertical size={16} className="text-sm text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <span className="text-xs text-gray-400 mb-4 uppercase">
          Perform Action
        </span>
        {children}
      </PopoverContent>
    </Popover>
  );
};

const className =
  "flex items-center justify-center rounded-lg bg-emerald-700 hover:bg-emerald-600 text-emerald-50 px-2.5 py-1.5 text-xs font-medium tracking-wide md:text-sm border border-emerald-500/40 shadow-sm transition-all duration-200 hover:shadow-emerald-400/20 disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-400 disabled:border-gray-600 disabled:hover:bg-gray-700 disabled:cursor-not-allowed";

export const ViewAction = ({
  href,
  disabled = false,
}: {
  href: string;
  disabled?: boolean;
}) => {
  return (
    <Link href={href}>
      <button disabled={disabled} className={className}>
        View
      </button>
    </Link>
  );
};

export const ViewActionButton = () => {
  return (
    <button type="button" className={className}>
      View
    </button>
  );
};



{/*

"use client";

import { EllipsisVertical } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export const ActionOptions = ({ children }: { children: React.ReactNode }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-full p-1"
        >
          <EllipsisVertical size={16} className="text-sm text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <span className="text-xs text-gray-400 mb-4 uppercase">
          Perform Action
        </span>
        {children}
      </PopoverContent>
    </Popover>
  );
};

const className =
  "flex items-center justify-center rounded-full bg-amber-300 hover:underline text-blue-600 px-1.5 py-1 text-xs md:text-sm disabled:text-gray-400 disabled:hover:no-underline disabled:cursor-not-allowed";

export const ViewAction = ({
  href,
  disabled = false,
}: {
  href: string;
  disabled?: boolean;
}) => {
  return (
    <Link href={href}>
      <button disabled={disabled} className={className}>
        View
      </button>
    </Link>
  );
};

export const ViewActionButton = () => {
  return (
    <button type="button" className={className}>
      View
    </button>
  );
};


*/}