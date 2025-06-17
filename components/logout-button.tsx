"use client";

import React from 'react';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const LogoutButton = () => {
  const { signOut } = useClerk();

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => signOut({ redirectUrl: "/sign-in" })}
            className="w-full group relative flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 bg-transparent border border-gray-700 text-gray-300 rounded-md hover:bg-red-900/20 hover:border-red-600/50 hover:text-red-400 transition-all duration-200 ease-in-out"
          >
            <LogOut className="size-5 text-gray-300 group-hover:text-red-400 transition-colors" />
            <span className="hidden lg:block font-medium">Logout</span>
            
            {/* Hover indicator */}
            <div className="absolute left-0 w-1 h-0 group-hover:h-4/5 bg-red-500 rounded-r-full transition-all duration-300 ease-out"></div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right" className="lg:hidden">
          Logout
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LogoutButton;