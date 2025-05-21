
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import React from "react";
import { SpeedInsights } from '@vercel/speed-insights/next';


const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen flex">
      {/* Sidebar - fixed position */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] fixed h-screen">
        <Sidebar />
      </div>
      
      {/* Spacer div that takes up the same width as the sidebar */}
      <div className="w-[14%] md:w-[8%] lg:w-[16%] xl:w-[14%] h-screen">
        {/* This is just a spacer */}
      </div>
      
      {/* Main content area */}
      <div className="w-[86%] md:w-[92%] lg:w-[84%] xl:w-[86%] bg-dark-300 flex flex-col">
        <Navbar />
        
        <div className="h-full w-full p-2">
          {children}
          <SpeedInsights />
          </div>
      </div>
    </div>
  );
};

export default ProtectedLayout;







