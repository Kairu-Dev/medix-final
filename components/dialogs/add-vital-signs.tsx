"use client";

import { addVitalSigns } from "@/app/actions/appointment";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CustomInput } from "../custom-input";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { VitalSignsSchema } from "@/lib/validation";

interface AddVitalSignsProps {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  medicalId?: string;
}

export type VitalSignsFormData = z.infer<typeof VitalSignsSchema>;

export const AddVitalSigns = ({
  patientId,
  doctorId,
  appointmentId,
  medicalId,
}: AddVitalSignsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<VitalSignsFormData>({
    resolver: zodResolver(VitalSignsSchema),
    defaultValues: {
      patient_id: patientId,
      medical_id: medicalId,
      body_temperature: undefined,
      heartRate: undefined,
      systolic: undefined,
      diastolic: undefined,
      respiratory_rate: undefined,
      oxygen_saturation: undefined,
      weight: undefined,
      height: undefined,
    },
  });

  const handleOnSubmit = async (data: VitalSignsFormData) => {
    try {
      setIsLoading(true);

      const res = await addVitalSigns(data, appointmentId, doctorId);

      if (res.success) {
        router.refresh();
        toast.success(res.msg);
        form.reset();
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add vital signs");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs sm:text-sm font-mono uppercase tracking-wide bg-gray-900/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30 hover:text-emerald-200 transition-all duration-300 backdrop-blur-sm shadow-lg px-2 sm:px-3"
          >
            <Plus size={18} className="text-emerald-500 mr-1 sm:mr-2 sm:w-5 sm:h-5" /> 
            <span className="hidden sm:inline">Add Vital Signs</span>
            <span className="sm:hidden">Add Vitals</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-gray-900/90 border border-emerald-500/40 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden w-[95vw] max-w-2xl max-h-[95vh] sm:max-h-[90vh]">
          {/* Minecraft-style decorative elements - responsive */}
          <div className="absolute top-0 left-0 w-6 h-6 sm:w-10 sm:h-10 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-6 h-6 sm:w-10 sm:h-10 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-10 sm:h-10 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-10 sm:h-10 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
          
          {/* Ambient glow effects - responsive */}
          <div className="absolute -top-3 right-6 w-20 h-20 sm:-top-5 sm:right-10 sm:w-36 sm:h-36 bg-emerald-300/15 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute -bottom-3 left-6 w-16 h-16 sm:-bottom-5 sm:left-10 sm:w-32 sm:h-32 bg-emerald-200/10 rounded-full blur-xl sm:blur-2xl"></div>
          
          {/* Scrollable container */}
          <div className="max-h-[80vh] sm:max-h-[75vh] remove-scrollbar overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/50 scrollbar-track-gray-800/50 pr-2">
            <DialogHeader className="relative z-10 pb-4 sm:pb-6">
              <DialogTitle className="text-emerald-200 font-mono uppercase tracking-wider text-lg sm:text-xl">
                Add Vital Signs
              </DialogTitle>
              <DialogDescription className="text-emerald-300/80 font-mono tracking-wide text-sm sm:text-base">
                Add vital signs for the patient
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleOnSubmit)}
                className="space-y-4 sm:space-y-6 md:space-y-8 relative z-10 pb-4"
              >
                {/* Temperature and Heart Rate */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="w-full sm:w-1/2">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="body_temperature"
                      label="Body Temperature (°C)"
                      placeholder="eg.:37.5"
                    />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="heartRate"
                      placeholder="eg: 54-123"
                      label="Heart Rate (BPM)"
                    />
                  </div>
                </div>

                {/* Blood Pressure */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="w-full sm:w-1/2">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="systolic"
                      placeholder="eg: 120"
                      label="Systolic BP"
                    />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="diastolic"
                      placeholder="eg: 80"
                      label="Diastolic BP"
                    />
                  </div>
                </div>

                {/* Weight and Height */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="w-full sm:w-1/2">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="weight"
                      placeholder="eg.: 80"
                      label="Weight (Kg)"
                    />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="height"
                      placeholder="eg.: 175"
                      label="Height (Cm)"
                    />
                  </div>
                </div>

                {/* Respiratory Rate and Oxygen Saturation */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="w-full sm:w-1/2">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="respiratory_rate"
                      placeholder="Optional"
                      label="Respiratory Rate"
                    />
                  </div>
                  <div className="w-full sm:w-1/2">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="oxygen_saturation"
                      placeholder="Optional"
                      label="Oxygen Saturation"
                    />
                  </div>
                </div>

                {/* Submit Button - Sticky at bottom */}
                <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur-sm pt-4 mt-6 border-t border-emerald-500/20">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full bg-gradient-to-b from-emerald-500/70 to-emerald-900/70 border border-emerald-500/40 text-white font-mono uppercase tracking-wider hover:from-emerald-400/70 hover:to-emerald-800/70 transition-all duration-300 disabled:opacity-50 py-2 sm:py-3 text-sm sm:text-base"
                  >
                    {isLoading ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};




{/* 
"use client";

import { addVitalSigns } from "@/app/actions/appointment";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { CustomInput } from "../custom-input";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { VitalSignsSchema } from "@/lib/validation";

interface AddVitalSignsProps {
  patientId: string;
  doctorId: string;
  appointmentId: string;
  medicalId?: string;
}

export type VitalSignsFormData = z.infer<typeof VitalSignsSchema>;

export const AddVitalSigns = ({
  patientId,
  doctorId,
  appointmentId,
  medicalId,
}: AddVitalSignsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<VitalSignsFormData>({
    resolver: zodResolver(VitalSignsSchema),
    defaultValues: {
      patient_id: patientId,
      medical_id: medicalId,
      body_temperature: undefined,
      heartRate: undefined,
      systolic: undefined,
      diastolic: undefined,
      respiratory_rate: undefined,
      oxygen_saturation: undefined,
      weight: undefined,
      height: undefined,
    },
  });

  const handleOnSubmit = async (data: VitalSignsFormData) => {
    try {
      setIsLoading(true);

      const res = await addVitalSigns(data, appointmentId, doctorId);

      if (res.success) {
        router.refresh();
        toast.success(res.msg);
        form.reset();
      } else {
        toast.error(res.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to add vital signs");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-sm font-mono uppercase tracking-wide bg-gray-900/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/30 hover:text-emerald-200 transition-all duration-300 backdrop-blur-sm shadow-lg"
          >
            <Plus size={22} className="text-emerald-500 mr-1" /> Add Vital Signs
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-gray-900/90 border border-emerald-500/40 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden">
          {/* Minecraft-style decorative elements 
          <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
          
          {/* Ambient glow effects 
          <div className="absolute -top-5 right-10 w-36 h-36 bg-emerald-300/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-5 left-10 w-32 h-32 bg-emerald-200/10 rounded-full blur-2xl"></div>
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-emerald-200 font-mono uppercase tracking-wider">Add Vital Signs</DialogTitle>
            <DialogDescription className="text-emerald-300/80 font-mono tracking-wide">
              Add vital signs for the patient
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-8 relative z-10"
            >
              <div className="flex items-center gap-4">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="body_temperature"
                  label="Body Temperature (°C)"
                  placeholder="eg.:37.5"
                />
                <CustomInput
                  type="input"
                  control={form.control}
                  name="heartRate"
                  placeholder="eg: 54-123"
                  label="Heart Rate (BPM)"
                />
              </div>

              <div className="flex items-center gap-4">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="systolic"
                  placeholder="eg: 120"
                  label="Systolic BP"
                />
                <CustomInput
                  type="input"
                  control={form.control}
                  name="diastolic"
                  placeholder="eg: 80"
                  label="Diastolic BP"
                />
              </div>

              <div className="flex items-center gap-4">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="weight"
                  placeholder="eg.: 80"
                  label="Weight (Kg)"
                />
                <CustomInput
                  type="input"
                  control={form.control}
                  name="height"
                  placeholder="eg.: 175"
                  label="Height (Cm)"
                />
              </div>

              <div className="flex items-center gap-4">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="respiratory_rate"
                  placeholder="Optional"
                  label="Respiratory Rate"
                />
                <CustomInput
                  type="input"
                  control={form.control}
                  name="oxygen_saturation"
                  placeholder="Optional"
                  label="Oxygen Saturation"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-gradient-to-b from-emerald-500/70 to-emerald-900/70 border border-emerald-500/40 text-white font-mono uppercase tracking-wider hover:from-emerald-400/70 hover:to-emerald-800/70 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? "Submitting..." : "Submit"}
                
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

*/}