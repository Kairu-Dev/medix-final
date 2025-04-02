import db from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoDataFound } from "../no-data-found";
import { AddDiagnosis } from "../dialogs/add-diagnosis";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { checkRole } from "@/utils/roles";
import { MedicalHistoryCard } from "./medical-history-card";

export const DiagnosisContainer = async({
    patientId,
    doctorId,
    id,
} : {
    patientId: string;
    doctorId: string;
    id: string;
}) => {
   
    const {userId} = await auth();

    if(!userId) redirect("/sign-in");

    const data = await db.medicalRecords.findFirst({
        where: { appointment_id: Number(id) },
        include: {
            diagnosis: {
                include: { doctor: true },
                orderBy: { created_at: "desc" },
            },
        },
        orderBy: { created_at: "desc" },

    });

    const diagnosis = data?.diagnosis || null;
    const isPatient = await checkRole("PATIENT")


    return (

        <div className="relative z-10">
            {
                diagnosis?.length === 0 || !diagnosis ? (
                    <div className="flex flex-col items-center justify-center mt-20 p-6 bg-emerald-950/40 border border-emerald-500/30 rounded-xl backdrop-blur-sm">
                        <div className="absolute -top-3 -right-3 w-20 h-20 bg-emerald-300/10 rounded-full blur-xl"></div>
                        <NoDataFound note="No diagnosis found" />
                        <AddDiagnosis 
                        key={new Date().getTime()}
                        patientId={patientId}
                        doctorId={doctorId}
                        appointmentId={id}
                        medicalId={data?.id.toString() || ""} 
                        />
                    </div>    
                ) : (

                    <section className="space-y-6">
                        <Card className="bg-gray-900/60 border border-emerald-500/40 rounded-xl shadow-lg relative backdrop-blur-sm overflow-hidden">
                            {/* Minecraft-style decorative elements */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
                            
                            {/* Enhanced emerald glow effects */}
                            <div className="absolute -top-5 right-10 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl"></div>
                            <div className="absolute -bottom-5 left-10 w-28 h-28 bg-emerald-200/15 rounded-full blur-3xl"></div>
                            
                            <CardHeader className="flex flex-row items-center justify-between relative z-10 border-b border-emerald-500/30 bg-gradient-to-r from-emerald-900/40 to-emerald-950/60">
                                <CardTitle className="text-emerald-100 font-mono uppercase tracking-wider flex items-center">
                                    <div className="h-4 w-1 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] mr-3"></div>
                                    Diagnosis
                                </CardTitle>
                                {
                                    !isPatient && (
                                        <AddDiagnosis 
                                        key={new Date().getTime()}
                                        patientId={patientId}
                                        doctorId={doctorId}
                                        appointmentId={id}
                                        medicalId={data?.id.toString() || ""}
                                        />
                                    )}
                            </CardHeader>
                            <CardContent className="mt-4 p-4 bg-gradient-to-b from-emerald-50/5 to-emerald-900/20 rounded-lg">
                                <div className="space-y-4">
                                    {
                                        diagnosis?.map((record, id) => (
                                            <div key={record.id} className="transition-all duration-200 hover:translate-x-1">
                                                <MedicalHistoryCard 
                                                record={record}
                                                index={id}
                                                />
                                            </div>
                                        ))
                                    }
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                )}
        </div>
    )
};