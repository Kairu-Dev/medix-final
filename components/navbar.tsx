"use client";
import { useAuth, UserButton } from "@clerk/nextjs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Bell, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
    console.log("Navbar component rendering");
    
    // All hooks at the top level
    const [isMounted, setIsMounted] = useState(false);
    console.log("isMounted state:", isMounted);
    
    const user = useAuth();
    console.log("User auth state:", user?.userId ? "User logged in" : "No user or not loaded");
    
    const pathname = usePathname();
    console.log("Current pathname:", pathname);
    
    // Prepare a path value directly here
    const rawPath = pathname ? pathname.split("/") : [];
    console.log("Split path:", rawPath);
    
    const lastIndex = rawPath.length - 1 > 2 ? 2 : rawPath.length - 1;
    console.log("Using index:", lastIndex);
    
    const rawPathName = rawPath[lastIndex] || "";
    const formattedPath = rawPathName.replace(/-/g, " ");
    console.log("Formatted path:", formattedPath);
    
    // Get a default display value
    const displayPath = isMounted ? (formattedPath || "Overview") : "Overview";
    console.log("Final display path:", displayPath);
    
    useEffect(() => {
        console.log("Component mounted effect running");
        setIsMounted(true);
        
        return () => {
            console.log("Component unmounting");
        };
    }, []);
    
    try {
        return (
            <div className="relative">
                {/* Main navbar with gradient background */}
                <div className="px-4 sm:px-5 lg:px-6 py-4 flex justify-between items-center bg-gradient-to-r from-green-800 via-green-900 to-emerald-900 shadow-lg border-b border-green-700/50">
                    {/* Left section - Menu button (mobile) + Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMenuToggle}
                            className="lg:hidden p-2 hover:bg-green-800/50 text-green-100 hover:text-white transition-colors"
                        >
                            <Menu size={20} />
                        </Button>
                        
                        {/* Page title */}
                        <div className="min-w-0 flex-1">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white capitalize truncate">
                                {displayPath}
                            </h1>
                            {/* Breadcrumb indicator for larger screens */}
                            <div className="hidden sm:block text-xs text-green-200/80 mt-0.5">
                                {pathname && pathname !== "/" && (
                                    <span className="truncate">
                                        {pathname.split("/").filter(Boolean).join(" / ").replace(/-/g, " ")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Right section - User */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        {/* Notification Bell - Work in Progress */}
                        <VisuallyHidden>
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="relative p-2 hover:bg-green-800/50 text-green-100 hover:text-white transition-all duration-200 rounded-full"
                                        >
                                            <Bell size={18} className="sm:size-5" />
                                            {/* Notification badge */}
                                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[10px] font-medium flex items-center justify-center border-2 border-green-900 shadow-sm">
                                                2
                                            </span>
                                            {/* Pulse animation for new notifications */}
                                            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full animate-ping opacity-75"></span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>You have 2 new notifications</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </VisuallyHidden>
                        
                        {/* User Button */}
                        <div className="flex items-center">
                            {isMounted && user?.userId ? (
                                <div className="rounded-full hover:ring-green-400/50 transition-all duration-200">
                                    <UserButton 
                                        appearance={{
                                            elements: {
                                                avatarBox: "w-8 h-8 sm:w-9 sm:h-9",
                                            }
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-green-700 animate-pulse"></div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Subtle bottom border with gradient */}
                <div className="h-0.5 bg-gradient-to-r from-transparent via-green-400/50 to-transparent"></div>
            </div>
        );
    } catch (error) {
        console.error("Error rendering Navbar:", error);
        return (
            <div className="px-4 sm:px-5 lg:px-6 py-4 bg-gradient-to-r from-green-800 via-green-900 to-emerald-900 shadow-lg">
                <div className="text-white">Error loading navigation</div>
            </div>
        );
    }
};

export default Navbar;