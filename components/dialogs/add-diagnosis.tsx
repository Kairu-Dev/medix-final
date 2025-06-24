"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { CardDescription, CardHeader } from "../ui/card";
import { Form } from "../ui/form";
import { CustomInput } from "../custom-input";
import { toast } from "sonner";
import { DiagnosisSchema } from "@/lib/validation";
import { addDiagnosis } from "@/app/actions/medical";


interface AddDiagnosisProps {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  medicalId: string;

  isNurse?: boolean;
}



export type DiagnosisFormData = z.infer<typeof DiagnosisSchema>;
export const AddDiagnosis = ({
  patientId,
  doctorId,
  appointmentId,
  medicalId,
  isNurse = false,
}: AddDiagnosisProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<DiagnosisFormData>({
    resolver: zodResolver(DiagnosisSchema),
    defaultValues: {
      patient_id: patientId,
      medical_id: medicalId,
      doctor_id: doctorId,
      symptoms: "",
      diagnosis: "",
      notes: "",
      prescribed_medications: "",
      follow_up_plan: "",
    },
  });

  const handleOnSubmit = async (data: DiagnosisFormData) => {
    try {
      setLoading(true);

      const res = await addDiagnosis(data, appointmentId);

      if (res.success) {
        toast.success(res.message);
        router.refresh();
        form.reset();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add diagnosis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isNurse && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant={"outline"}
              size={"lg"}
              className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-emerald-100 mt-4 border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.3)] font-mono uppercase tracking-wider hover:bg-emerald-800 transition-all duration-300 w-full sm:w-auto"
            >
              <Plus size={22} className="text-emerald-300 mr-2" />
              Add Diagnosis
            </Button>
          </DialogTrigger>

        <DialogContent className="w-[96vw] max-w-[96vw] sm:max-w-[85vw] md:max-w-[75vw] lg:max-w-[65vw] xl:max-w-[55vw] 2xl:max-w-[40vw] h-[80vh] sm:h-[85vh] md:h-[90vh] max-h-[80vh] sm:max-h-[85vh] md:max-h-[90vh] bg-gradient-to-b from-gray-900/90 to-gray-950/90 border border-emerald-500/40 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden flex flex-col">
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
          
          {/* Glow effects - hidden on mobile for better performance */}
          <div className="hidden sm:block absolute -top-5 right-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
          <div className="hidden sm:block absolute -bottom-5 left-20 w-32 h-32 bg-emerald-200/15 rounded-full blur-3xl"></div>
          
          <CardHeader className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 relative z-10 flex-shrink-0">
            <DialogTitle className="text-emerald-100 font-mono uppercase tracking-wider text-sm sm:text-base md:text-lg lg:text-xl">Add New Diagnosis</DialogTitle>
            <CardDescription className="text-emerald-300/80 text-xs sm:text-sm md:text-base leading-relaxed">
             Add patient diagnosis information with precision and clarity. 
             Include all relevant medical findings and assessments for proper patient care.
            </CardDescription>
          </CardHeader>

          <div className="flex-1 overflow-y-auto px-2 sm:px-4 md:px-6 relative z-10">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleOnSubmit)}
                className="space-y-2 xs:space-y-3 sm:space-y-4 md:space-y-6 pb-3 sm:pb-4 md:pb-6"
              >
                <div className="flex flex-col gap-4">
                  <CustomInput
                    type="textarea"
                    control={form.control}
                    name="symptoms"
                    label="Symptoms"
                    placeholder="Enter symptoms here ..."
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <CustomInput
                    type="textarea"
                    control={form.control}
                    name="diagnosis"
                    placeholder="Enter diagnosis here ..."
                    label="Diagnosis (Findings)"
                    
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <CustomInput
                    type="textarea"
                    control={form.control}
                    name="prescribed_medications"
                    placeholder="Enter principles here ..."
                    label="Prescriptions for this patient"
                  />
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-row gap-2 sm:gap-3 md:gap-4">
                  <CustomInput
                    type="textarea"
                    control={form.control}
                    name="notes"
                    placeholder="Optional note"
                    label="Additional Notes for this treatment"
                  />
                  <CustomInput
                    type="textarea"
                    control={form.control}
                    name="follow_up_plan"
                    placeholder="Optional"
                    label="Follow Up Plan"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 w-full text-emerald-100 font-mono uppercase tracking-wider border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.2)] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 sticky bottom-0 mt-4 sm:mt-6 py-3 sm:py-2"
                >
                  {loading ? "Processing..." : "Submit"}
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      )}
    </>
  );
};







{/*
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { CardDescription, CardHeader } from "../ui/card";
import { Form } from "../ui/form";
import { CustomInput } from "../custom-input";
import { toast } from "sonner";
import { DiagnosisSchema } from "@/lib/validation";
import { addDiagnosis } from "@/app/actions/medical";


interface AddDiagnosisProps {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  medicalId: string;

  isNurse?: boolean;
}



export type DiagnosisFormData = z.infer<typeof DiagnosisSchema>;
export const AddDiagnosis = ({
  patientId,
  doctorId,
  appointmentId,
  medicalId,
  isNurse = false,
}: AddDiagnosisProps) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<DiagnosisFormData>({
    resolver: zodResolver(DiagnosisSchema),
    defaultValues: {
      patient_id: patientId,
      medical_id: medicalId,
      doctor_id: doctorId,
      symptoms: "",
      diagnosis: "",
      notes: "",
      prescribed_medications: "",
      follow_up_plan: "",
    },
  });

  const handleOnSubmit = async (data: DiagnosisFormData) => {
    try {
      setLoading(true);

      const res = await addDiagnosis(data, appointmentId);

      if (res.success) {
        toast.success(res.message);
        router.refresh();
        form.reset();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add diagnosis");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isNurse && (
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant={"outline"}
              size={"lg"}
              className="bg-gradient-to-r from-emerald-700 to-emerald-900 text-emerald-100 mt-4 border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.3)] font-mono uppercase tracking-wider hover:bg-emerald-800 transition-all duration-300"
            >
              <Plus size={22} className="text-emerald-300 mr-2" />
              Add Diagnosis
            </Button>
          </DialogTrigger>

        <DialogContent className="sm:max-w-[60%] 2xl:max-w-[40%] bg-gradient-to-b from-gray-900/90 to-gray-950/90 border border-emerald-500/40 rounded-xl shadow-lg backdrop-blur-sm">
          {/* Decorative corners 
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
          
          {/* Glow effects 
          <div className="absolute -top-5 right-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-5 left-20 w-32 h-32 bg-emerald-200/15 rounded-full blur-3xl"></div>
          
          <CardHeader className="px-0 relative z-10">
            <DialogTitle className="text-emerald-100 font-mono uppercase tracking-wider text-xl">Add New Diagnosis</DialogTitle>
            <CardDescription className="text-emerald-300/80">
             Add patient diagnosis information with precision and clarity. 
             Include all relevant medical findings and assessments for proper patient care.
            </CardDescription>
          </CardHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-6 relative z-10"
            >
              <div className="flex items-center gap-4">
                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="symptoms"
                  label="Symptoms"
                  placeholder="Enter symptoms here ..."
                />
              </div>

              <div className="flex items-center gap-4">
                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="diagnosis"
                  placeholder="Enter diagnosis here ..."
                  label="Diagnosis (Findings)"
                  
                />
              </div>
              <div className="flex items-center gap-4">
                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="prescribed_medications"
                  placeholder="Enter principles here ..."
                  label="Prescriptions for this patient"
                />
              </div>

              <div className="flex items-center gap-4">
                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="notes"
                  placeholder="Optional note"
                  label="Additional Notes for this treatment"
                />
                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="follow_up_plan"
                  placeholder="Optional"
                  label="Follow Up Plan"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 w-full text-emerald-100 font-mono uppercase tracking-wider border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.2)] disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
              >
                {loading ? "Processing..." : "Submit"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      )}
    </>
  );
};

*/}