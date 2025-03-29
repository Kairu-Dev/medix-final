import db from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { calculateBMI } from "@/utils";
import { stat } from "fs";
import { format } from "date-fns";

import { checkRole } from "@/utils/roles";
import { Separator } from "../ui/separator";
import { AddVitalSigns } from "../dialogs/add-vital-signs";


interface VitalSignsProps {
  id: number | string;
  patientId: string;
  doctorId: string;
  medicalId?: string;
  appointmentId?: string;
}

const ItemCard = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="w-full">
      <p className="text-lg xl:text-xl font-medium text-emerald-200">{value}</p>
      <p className="text-sm xl:text-base text-emerald-300/80 font-mono tracking-wide">{label}</p>
    </div>
  );
};
export const VitalSigns = async ({
  id,
  patientId,
  doctorId,
}: VitalSignsProps) => {
  const data = await db.medicalRecords.findFirst({
    where: { appointment_id: Number(id) },
    include: {
      vital_signs: {
        orderBy: { created_at: "desc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const vitals = data?.vital_signs || null;

  const isPatient = await checkRole("PATIENT");

  return (
    <section id="vital-signs" className="relative">
      {/* Enhanced emerald glow effects */}
      <div className="absolute -top-5 right-10 w-36 h-36 bg-emerald-300/15 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-5 left-10 w-32 h-32 bg-emerald-200/10 rounded-full blur-2xl"></div>
      
      <Card className="bg-gray-900/60 border border-emerald-500/40 rounded-xl shadow-lg backdrop-blur-sm relative overflow-hidden">
        {/* Minecraft-style decorative elements */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
        
        <CardHeader className="flex flex-row justify-between items-center relative z-10">
          <CardTitle className="text-white font-mono uppercase tracking-wider">Vital Signs</CardTitle>

          {!isPatient && (
            <AddVitalSigns
              key={new Date().getTime()}
              patientId={patientId}
              doctorId={doctorId}
              appointmentId={id!.toString()}
              medicalId={data ? data?.id!.toString() : ""}
            />
          )}
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          {vitals?.map((el) => {
            const { bmi, status, colorCode } = calculateBMI(
              el.weight || 0,
              el.height || 0
            );

            return (
              <div className="space-y-4 bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 rounded-xl p-4 border border-emerald-500/30 shadow-md backdrop-blur-sm" key={el?.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ItemCard
                    label="Body Temperature"
                    value={`${el?.body_temperature}°C`}
                  />
                  <ItemCard
                    label="Blood Pressure"
                    value={`${el?.systolic} / ${el?.diastolic} mmHg`}
                  />
                  <ItemCard label="Heart Rate" value={`${el?.heartRate} bpm`} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ItemCard label="Weight" value={`${el?.weight} kg`} />
                  <ItemCard label="Height" value={`${el?.height} cm`} />

                  <div className="w-full">
                    <div className="flex gap-x-2 items-center">
                      <p className="text-lg xl:text-xl font-medium text-emerald-200">{bmi}</p>
                      <span
                        className="text-sm font-medium"
                        style={{ color: colorCode }}
                      >
                        ({status})
                      </span>
                    </div>
                    <p className="text-sm xl:text-base text-emerald-300/80 font-mono tracking-wide">BMI</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ItemCard
                    label="Respiratory Rate"
                    value={`${el?.respiratory_rate || "N/A"}`}
                  />
                  <ItemCard
                    label="Oxygen Saturation"
                    value={`${el?.oxygen_saturation || "n/a"}`}
                  />
                  <ItemCard
                    label="Reading Date"
                    value={format(el?.created_at, "MMM d, yyyy hh:mm a")}
                  />
                </div>
                <Separator className="mt-4 bg-emerald-500/30" />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </section>
  );
};