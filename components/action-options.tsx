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
          className="flex items-center justify-center rounded-full p-1 bg-emerald-900"
        >
          <EllipsisVertical size={16} className="text-sm text-emerald-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3 py-6 px-3 bg-gray-900/90 border border-emerald-500/40 rounded-xl shadow-lg backdrop-blur-sm">
         {/* Minecraft-style decorative elements */}
         <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
          
          {/* Enhanced emerald glow effects */}
          <div className="absolute -top-4 right-8 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-4 left-16 w-24 h-24 bg-emerald-200/15 rounded-full blur-3xl"></div>
          
        <span className="text-lg text-emerald-200/80 max-w-xs text-center font-medium">
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