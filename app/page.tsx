import { Button } from "@/components/ui/button";
import { getRole } from "@/utils/roles";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const { userId } = await auth();
  const role = await getRole();

  if (userId && role) {
    redirect(`/${role}`);
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center h-screen p-6">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-center text-white">
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
                
                <Link href={`/${role}`}>
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
                    <Button variant="outline" className='md:text-base font-medium underline text-white hover:text-green-400'>Login to account</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-8" >
        <p className="copyright justify-items-end text-dark-600 xl:text-left">
              © 2025 MEDIX Integrated Hospital Management System. All rights reserved.
            </p>
        </footer>

      </div>
      
      <div className="absolute top-4 right-4">
       {/* <ModeToggle /> Broken Light Mode Disable For Now (caused by bg-dark-300 at layout find a solution to separate them) */} 
      </div>
    </div>
  );
}