import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DiagnosisContainer } from "./appointment/diagnosis-container";

interface DataProps {
  id: string | number;
  patientId: string;
  medicalId?: string;
  doctor_id: string | number;
  label: React.ReactNode;
}
export const MedicalHistoryDialog = async ({
  id,
  patientId,
  doctor_id,
  label,
}: DataProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-full bg-emerald-600/10 hover:bg-emerald-700/20 text-emerald-500 px-1.5 py-1 text-xs md:text-sm border border-emerald-500/30"
        >
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90%] max-w-[425px] md:max-w-2xl 2xl:max-w-4xl p-8 overflow-y-auto remove-scrollbar bg-gray-900/95 border border-emerald-500/40 rounded-xl">
       
        
        <DiagnosisContainer
          id={String(id)}
          patientId={patientId!}
          doctorId={String(doctor_id)}
        /> 
        <VisuallyHidden>
          <DialogTitle>Medical History</DialogTitle>
        </VisuallyHidden>
        <p className="text-emerald-300/80 font-mono text-sm mt-4">Diagnosis container form</p>
      </DialogContent>
    </Dialog>
  );
};