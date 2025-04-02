import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { checkRole } from "@/utils/roles";
import { ReviewForm } from "../dialogs/review-form";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


const AppointmentQuickLinks = async({ staffId }: { staffId: string }) => {
    const isPatient = await checkRole("PATIENT");
  return (
    <Card className="w-full rounded-xl bg-gray-900/60 border border-emerald-500/40 shadow-lg relative backdrop-blur-sm">  
        {/* Minecraft-style decorative elements */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
        
        {/* Enhanced emerald glow effects */}
        <div className="absolute -top-5 right-10 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-5 left-10 w-24 h-24 bg-emerald-200/15 rounded-full blur-3xl"></div>
        
        <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-bold text-emerald-100 tracking-wider font-mono uppercase">Quick Links</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 relative z-10">
            <Link 
            href="?category=charts"
            className="px-4 py-2 rounded-lg bg-emerald-900 text-emerald-100 border border-emerald-500/50 hover:bg-emerald-800 transition-colors duration-200 shadow-md hover:shadow-emerald-500/20"
            >
            Charts
            </Link>
            <Link 
            href="?category=appointments"
            className="px-4 py-2 rounded-lg bg-teal-900 text-teal-100 border border-teal-500/50 hover:bg-teal-800 transition-colors duration-200 shadow-md hover:shadow-teal-500/20"
            >
            Appointments
            </Link>
            <Link 
            href="?category=diagnosis"
            className="px-4 py-2 rounded-lg bg-blue-900 text-blue-100 border border-blue-500/50 hover:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-blue-500/20"
            >
            Diagnosis
            </Link>
            <Link 
            href="?category=billing"
            className="px-4 py-2 rounded-lg bg-amber-900 text-amber-100 border border-amber-500/50 hover:bg-amber-800 transition-colors duration-200 shadow-md hover:shadow-amber-500/20"
            >
            Bills
            </Link>
            <Link 
            href="?category=medical-history"
            className="px-4 py-2 rounded-lg bg-red-900 text-red-100 border border-red-500/50 hover:bg-red-800 transition-colors duration-200 shadow-md hover:shadow-red-500/20"
            >
            Medical History
            </Link>

            <Link 
            href="?category=payments"
            className="px-4 py-2 rounded-lg bg-purple-900 text-purple-100 border border-purple-500/50 hover:bg-purple-800 transition-colors duration-200 shadow-md hover:shadow-purple-500/20"
            >
            Payments
            </Link>

            <VisuallyHidden>

            <Link 
            href="?category=lab-test"
            className="px-4 py-2 rounded-lg bg-indigo-900 text-indigo-100 border border-indigo-500/50 hover:bg-indigo-800 transition-colors duration-200 shadow-md hover:shadow-indigo-500/20"
            >
            Lab Test
            </Link>

            </VisuallyHidden>

            <Link
            href="?category=appointments#vital-signs"
            className="px-4 py-2 rounded-lg bg-cyan-900 text-cyan-100 border border-cyan-500/50 hover:bg-cyan-800 transition-colors duration-200 shadow-md hover:shadow-cyan-500/20"
            >
            Vital Signs
            </Link>

         

            {isPatient &&  <ReviewForm staffId={staffId}/> }

         

        </CardContent>
    </Card>
  )
}

export default AppointmentQuickLinks