"use client";

import React from 'react'
import { Button } from './ui/button'
import { LogOut } from 'lucide-react'
import { useClerk } from '@clerk/nextjs';

export const LogoutButton = () => {

  const { signOut } = useClerk();

  return (

    <Button 
    className="shad-primary-btn w-fit bottom-0 gap-2 px-0 md:px-4"
    onClick={() => signOut({ redirectUrl: "/sign-in" })}
    variant="outline"
    >
      <LogOut />
      <span className="hidden lg:block text-white font-sans font-bold">Logout</span>
    </Button>

  )
}

export default LogoutButton