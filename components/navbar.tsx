"use client";
import { useAuth, UserButton } from "@clerk/nextjs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react'

/* eslint-disable */
export const Navbar = () => {
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
            <div className="p-5 flex justify-between bg-green-900">
                <h1 className="text-24-bold text-gray-100 capitalize">
                    {displayPath}
                </h1>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <VisuallyHidden>
                            <Bell />
                            <p className="absolute -top-4 right-1 size-4 bg-red-700 text-white rounded-full text-[10px] text-center">
                                2
                            </p>
                        </VisuallyHidden>
                    </div>
                    {isMounted && user?.userId ? <UserButton /> : null}
                </div>
            </div>
        );
    } catch (error) {
        console.error("Error rendering Navbar:", error);
        return <div className="p-5 bg-green-900">Error loading navigation</div>;
    }
};

export default Navbar;