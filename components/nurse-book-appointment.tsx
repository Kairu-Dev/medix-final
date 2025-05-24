"use client";
 /* eslint-disable */
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppointmentSchema } from "@/lib/validation";
import { generateTimes } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Doctor, Patient, PriorityLevel } from "@prisma/client";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { UserPen, Activity, AlertTriangle, HeartPulse } from "lucide-react";
import { z } from "zod";

import { toast } from "sonner";
import { createNewAppointment } from "@/app/actions/appointment";
import { Button } from './ui/button';
import { DraggableDialogContent } from './Draggable-Content';
import { ProfileImage } from './profile-image';
import { Form } from './ui/form';
import { CustomInput } from './custom-input';
import AppointmentPriorityAnalyzer from './AppointmentPriorityAnalyzer';

// Enhanced appointment schema with priority fields
const EnhancedAppointmentSchema = AppointmentSchema.extend({
  priority_level: z.enum(['NORMAL', 'URGENT', 'EMERGENCY']).default('NORMAL'),
  priority_score: z.number().default(0),
  department: z.string().optional(),
  priority_override: z.boolean().default(false),
});

// Appointment types
const TYPES = [
  { label: "General Consultation", value: "General Consultation" },
  { label: "General Check up", value: "General Check Up" },
  { label: "Antenatal", value: "Antenatal" },
  { label: "Maternity", value: "Maternity" },
  { label: "Emergency", value: "Emergency" },
];

interface NurseBookAppointmentProps {
  patient: Patient;
  doctors: Doctor[];
  nurseId: string;
}

export const NurseBookAppointment = ({ patient, doctors, nurseId }: NurseBookAppointmentProps) => {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPriorityAnalyzer, setShowPriorityAnalyzer] = useState(false);
  const [priorityInfo, setPriorityInfo] = useState<{
    level: PriorityLevel;
    score: number;
    department: string;
  } | null>(null);
  const router = useRouter();

  const appointmentTimes = generateTimes(8, 17, 30);
  const patientName = `${patient?.first_name} ${patient?.last_name}`;

  const form = useForm<z.infer<typeof EnhancedAppointmentSchema>>({
    resolver: zodResolver(EnhancedAppointmentSchema),
    defaultValues: {
      doctor_id: "",
      appointment_date: "",
      time: "",
      type: "",
      note: "",
      priority_level: PriorityLevel.NORMAL,
      priority_score: 0,
    },
  });

  // Priority level indicator classes
  const getPriorityClasses = (level: PriorityLevel) => {
    switch(level) {
      case PriorityLevel.EMERGENCY:
        return {
          bg: "bg-red-900/20",
          border: "border-red-500/40",
          text: "text-red-500",
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />
        };
      case PriorityLevel.URGENT:
        return {
          bg: "bg-amber-900/20",
          border: "border-amber-500/40",
          text: "text-amber-500",
          icon: <Activity className="h-5 w-5 text-amber-500" />
        };
      default:
        return {
          bg: "bg-emerald-900/20",
          border: "border-emerald-500/40",
          text: "text-emerald-500",
          icon: <HeartPulse className="h-5 w-5 text-emerald-500" />
        };
    }
  };

  // Watch for note changes to enable analyzer automatically
  const note = form.watch("note");
  useEffect(() => {
    if (note && note.length > 5 && !showPriorityAnalyzer) {
      setShowPriorityAnalyzer(true);
    }
  }, [note]);

  // Handle priority assignment from analyzer
  const handlePriorityAssigned = (
    level: PriorityLevel,
    score: number,
    suggestedDepartment: string,
    suggestedDoctorId: string,
    isOverride: boolean = false
  ) => {
    form.setValue("priority_level", level);
    form.setValue("priority_score", score);
    form.setValue("doctor_id", suggestedDoctorId);
    form.setValue("priority_override", isOverride);

    setPriorityInfo({
      level,
      score,
      department: suggestedDepartment
    });

    toast.success(`Priority set to ${level} (Score: ${score})`);
  };

  const onSubmit: SubmitHandler<z.infer<typeof EnhancedAppointmentSchema>> = async (values) => {
    try {
      setIsSubmitting(true);
      
      const newData = { 
        ...values, 
        patient_id: patient?.id!,
        booked_by: nurseId, // Add nurse ID as the booker
        priority_level: values.priority_level,
        priority_score: values.priority_score,
        priorityAssessment: {
          create: {
            condition: values.note || "",
            appointment_type: values.type,
            priority_score: values.priority_score,
            priority_level: values.priority_level,
            notes: `Auto-assigned priority: ${values.priority_level} (Booked by nurse)`,
            patient_id: patient?.id!
          }
        }
      };

      const res = await createNewAppointment(newData);

      if (res.success) {
        form.reset({});
        setPriorityInfo(null);
        setShowPriorityAnalyzer(false);
        router.refresh();
        toast.success(`Appointment booked successfully for ${patientName}`);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center gap-2 justify-start text-sm font-light bg-blue-600 text-white hover:bg-blue-700"
        >
          <UserPen size={16} /> Book for {patientName}
        </Button>
      </DialogTrigger>

      <DraggableDialogContent className="shad-dialog max-h-[90vh] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span>Loading...</span>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 max-h-[85vh]">
            <DialogHeader className="dialog-header border-b pb-2 mb-2 border-blue-500/20">
              <DialogTitle className="text-blue-400">Book Appointment for {patientName}</DialogTitle>
              <div className="text-xs text-blue-300/70">
                Booking as nurse
                <br />Drag anywhere on the background to move
              </div>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 mt-5 xl:mt-8 non-draggable"
              >
                {/* Patient Info Section */}
                <div className="w-full rounded-md border border-blue-500/30 bg-blue-950/20 px-3 py-1 flex items-center gap-4">
                  <ProfileImage
                    url={patient?.img!}
                    name={patientName}
                    bgColor={patient?.colorCode!}
                    className="size-16 border border-blue-500/30"
                  />
                  <div>
                    <p className="font-semibold text-lg text-blue-50">{patientName}</p>
                    <span className="text-sm text-blue-300 capitalize">
                      {patient?.gender}
                    </span>
                    <div className="text-xs text-blue-400/80 mt-1">
                      Nurse booking
                    </div>
                  </div>
                </div>

                {/* Appointment Type */}
                <CustomInput
                  type="select"
                  selectList={TYPES}
                  control={form.control}
                  name="type"
                  label="Appointment Type"
                  placeholder="Select an appointment type"
                />
                
                {/* Reason for Visit / Symptoms */}
                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="note"
                  placeholder="Describe symptoms or reason for appointment..."
                  label="Reason for Visit / Symptoms"
                />

                {/* Priority Analyzer */}
                {showPriorityAnalyzer && (
                  <div className="border rounded-md p-3 bg-blue-950/30 border-blue-500/30">
                    <h3 className="text-sm font-medium text-blue-400 mb-2">Priority Analysis</h3>
                    <AppointmentPriorityAnalyzer
                      patientId={patient.id}
                      appointmentNote={note || ""}
                      doctors={doctors || []}
                      onPriorityAssigned={handlePriorityAssigned}
                    />
                  </div>
                )}

                {/* Date and Time - Only show if priority has been analyzed */}
                {priorityInfo && (
                  <div className="flex items-center gap-2">
                    <CustomInput
                      type="input"
                      control={form.control}
                      name="appointment_date"
                      placeholder=""
                      label="Date"
                      inputType="date"
                    />
                    <CustomInput
                      type="select"
                      control={form.control}
                      name="time"
                      placeholder="Select time"
                      label="Time"
                      selectList={appointmentTimes}
                    />
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  disabled={isSubmitting || !form.formState.isValid || !priorityInfo}
                  type="submit"
                  className={`w-full ${
                    priorityInfo?.level === PriorityLevel.EMERGENCY ? 'bg-red-600 hover:bg-red-700' :
                    priorityInfo?.level === PriorityLevel.URGENT ? 'bg-amber-600 hover:bg-amber-700' :
                    'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Booking...' : 'Book Appointment'}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </DraggableDialogContent>
    </Dialog>
  );
};