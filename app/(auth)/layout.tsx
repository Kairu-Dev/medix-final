import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <SpeedInsights />
    </>
  );
};

export default AuthLayout;


{/* 


  import React from 'react'
import Image from 'next/image'
import { SpeedInsights } from '@vercel/speed-insights/next';


const AuthLayout = ({children}:{children: React.ReactNode}) => {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden">
      {/* Left content section 
      <div className="w-full md:w-1/2 flex flex-col p-4 md:p-8 order-2 md:order-1">
     
        <div className="flex-grow flex flex-col justify-center max-w-md mx-auto w-full">


        <Image
            src="/assets/icons/logo-full.svg"
            height={1000}
            width={1000}
            alt="patient"
            className="h-10 w-fit mb-3"
          />
          
          {children}
          <SpeedInsights />


          

          
        </div>
        
      </div>

      {/* Right image section - hidden on small screens 
      <div className="w-full md:w-1/2 relative h-40 md:h-auto order-1 md:order-2">
        <Image 
          src="/assets/images/onboarding-img.png"
          alt="Login Image"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />


           

      </div>

      
    </div>
  )
}

export default AuthLayout
  
  
  */}