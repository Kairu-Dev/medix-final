import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div>
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-center">
              Welcome to <br />
              <span className="text-green-500 text-5-xl md:text-6xl">MEDIX IHMS</span>
            </h1>
          </div>

          <div className="text-center max-w-xl flex flex-col items-center justify-center">
            <p className="mb-8 text-dark-700">
            Web-Based Integrated Hospital Management System with Multi-Algorithms for Optimization & Automation of Healthcare Operations
            </p>

            <div className="flex gap-4">
              {/* Check if the UserId exists = the user logs in */}
              {userId ? (
                <>
                
                <Link href={'/dashboard'}>
                <Button className="shad-primary-btn">View Dashboard</Button>
                </Link>

                <UserButton />
                </>
              ) : (
                <>
                  <Link href="/sign-up">
                    <Button className='shad-primary-btn md:text-base font-medium'>New Patient</Button>
                  </Link>

                  <Link href="/sign-in">
                    <Button variant="outline" className='md:text-base font-medium underline hover:text-green-400'>Login to account</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-8" >
        <p className="justify-items-end text-dark-600 xl:text-left">
              © 2025 MEDIX Integrated Hospital Management System. All rights reserved.
            </p>
        </footer>

      </div>
      
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
    </div>
  );
}