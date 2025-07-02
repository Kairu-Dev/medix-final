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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { AppointmentSchema } from "@/lib/validation";
import { generateTimes } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Doctor, Patient, PriorityLevel } from "@prisma/client";
import { useRouter } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
  
import { Button } from "./ui/button";
import { UserPen, Activity, AlertTriangle, HeartPulse, Stethoscope, UserCheck } from "lucide-react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { ProfileImage } from "./profile-image";
import { CustomInput } from "./custom-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import { createNewAppointment } from "@/app/actions/appointment";
import AppointmentPriorityAnalyzer from './AppointmentPriorityAnalyzer';
import { getDoctorLoadFactors } from '@/app/actions/doctor-load';
import { getDoctorWorkingDays } from '@/app/actions/doctor-schedule';
import TimeSlotSelector from './TimeSlotSelector';

const EnhancedAppointmentSchema = AppointmentSchema.extend({
  priority_level: z.enum(['NORMAL', 'URGENT', 'EMERGENCY']).default('NORMAL'),
  priority_score: z.number().default(0),
  department: z.string().optional(),
  priority_override: z.boolean().default(false),
  appointment_date: z.string().min(1, "Select appointment date"),
});

// Appointment types
const TYPES = [
  { label: "General Consultation", value: "General Consultation" },
  { label: "General Check up", value: "General Check Up" },
  { label: "Antenatal", value: "Antenatal" },
  { label: "Maternity", value: "Maternity" },
  { label: "Emergency", value: "Emergency" },
  { label: "Follow-Up", value: "Follow Up" },
];

interface NurseBookAppointmentProps {
  patient: Patient;
  doctors: Doctor[];
  nurseId: string;
  nurseName?: string;
}

// Dynamic timezone date formatting helper
const formatDateWithUserTimezone = (date: Date | undefined) => {
  if (!date) return "";
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Get user's timezone info for display
const getUserTimezoneInfo = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offsetMinutes = new Date().getTimezoneOffset();
  const offsetHours = Math.abs(offsetMinutes / 60);
  const offsetSign = offsetMinutes <= 0 ? '+' : '-';
  
  return {
    timezone,
    offset: `UTC${offsetSign}${offsetHours}`,
    isPhilippines: timezone === 'Asia/Manila'
  };
};

const generateDynamicTimes = (startTime: string, endTime: string, intervalMinutes: number = 30) => {
  const times = [];
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += intervalMinutes) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const timeString = `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
    
    times.push({
      label: timeString,
      value: timeString
    });
  }
  
  return times;
};

// Custom Calendar Date Picker Component
const CalendarDatePicker = ({ 
  value, 
  onChange, 
  placeholder = "Select date",
  disabled = false,
  className = "",
  selectedDoctorId,
  doctorWorkingDays
}: {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  selectedDoctorId?: string;
  doctorWorkingDays?: { day: string; start_time: string; close_time: string; }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const timezoneInfo = getUserTimezoneInfo();

  const isDateDisabled = (date: Date) => {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    maxDate.setHours(23, 59, 59, 999);
    
    if (checkDate > maxDate) return true;
    
    if (!selectedDoctorId || !doctorWorkingDays || doctorWorkingDays.length === 0) {
      return checkDate < today;
    }
    
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[checkDate.getDay()].toLowerCase();
    
    const doctorWorkingDay = doctorWorkingDays.find(
      workingDay => workingDay.day.toLowerCase() === dayOfWeek
    );
    
    if (!doctorWorkingDay) return true;
    if (checkDate < today) return true;
    
    if (checkDate.getTime() === today.getTime()) {
      const [closeHour, closeMinute] = doctorWorkingDay.close_time.split(':').map(Number);
      const closingTime = new Date();
      closingTime.setHours(closeHour, closeMinute, 0, 0);
      
      if (now >= closingTime) {
        return true;
      }
    }
    
    return false;
  };

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal bg-blue-900/60 border-blue-500/40 text-blue-100 hover:bg-blue-800/70 hover:border-blue-400/60 transition-all duration-200",
          !value && "text-blue-300/70",
          className
        )}
        disabled={disabled}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-blue-300" />
        {value ? format(value, "PPP") : <span>{placeholder}</span>}
      </Button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-blue-950/95 border border-blue-400/40 shadow-2xl rounded-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-blue-300 font-medium">Select Date</h3>
                <p className="text-xs text-blue-400/70 mt-1">
                  {timezoneInfo.timezone} ({timezoneInfo.offset})
                  {timezoneInfo.isPhilippines && " 🇵🇭"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-blue-400 hover:text-white"
              >
                ✕
              </Button>
            </div>
            
            <Calendar
              mode="single"
              selected={value}
              onSelect={(date) => {
                onChange(date);
                setIsOpen(false);
              }}
              disabled={isDateDisabled}
              initialFocus
              className="rounded-md border-0"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center text-blue-300",
                caption_label: "text-sm font-medium text-blue-300",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-blue-300 hover:bg-blue-800/50 rounded-md transition-colors",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-blue-300/80 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal text-blue-100 hover:bg-blue-700/60 hover:text-blue-50 rounded-md cursor-pointer transition-colors aria-selected:opacity-100",
                day_selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
                day_today: "bg-blue-800/80 text-blue-300 font-semibold",
                day_outside: "text-blue-500/50 opacity-50 aria-selected:bg-blue-600/50 aria-selected:text-white aria-selected:opacity-30",
                day_disabled: "text-blue-600/30 opacity-30 cursor-not-allowed hover:bg-transparent",
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export const NurseBookAppointment = ({ 
  patient, 
  doctors, 
  nurseId, 
  nurseName = "Nurse" 
}: NurseBookAppointmentProps) => {
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPriorityAnalyzer, setShowPriorityAnalyzer] = useState(false);
  const [doctorLoadFactors, setDoctorLoadFactors] = useState<Record<string, number>>({});
  const [priorityInfo, setPriorityInfo] = useState<{
    level: PriorityLevel;
    score: number;
    department: string;
  } | null>(null);
  const router = useRouter();
  const [physicians, setPhysicians] = useState<Doctor[] | undefined>(doctors);
  const [doctorWorkingDays, setDoctorWorkingDays] = useState<{
    day: string;
    start_time: string;
    close_time: string;
  }[]>([]);
  const [availableTimes, setAvailableTimes] = useState<{label: string, value: string}[]>([]);
  const [loadingWorkingDays, setLoadingWorkingDays] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

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

  // Priority level indicator classes with nurse-centric colors
  const getPriorityClasses = (level: PriorityLevel) => {
    switch(level) {
      case PriorityLevel.EMERGENCY:
        return {
          bg: "bg-red-900/30",
          border: "border-red-500/50",
          text: "text-red-400",
          icon: <AlertTriangle className="h-5 w-5 text-red-400" />
        };
      case PriorityLevel.URGENT:
        return {
          bg: "bg-amber-900/30",
          border: "border-amber-500/50",
          text: "text-amber-400",
          icon: <Activity className="h-5 w-5 text-amber-400" />
        };
      default:
        return {
          bg: "bg-blue-900/30",
          border: "border-blue-500/50",
          text: "text-blue-400",
          icon: <HeartPulse className="h-5 w-5 text-blue-400" />
        };
    }
  };

  useEffect(() => {
    if (doctors.length > 0) {
      const fetchLoadFactors = async () => {
        const doctorIds = doctors.map(d => d.id);
        const result = await getDoctorLoadFactors(doctorIds);
        if (result.success) {
          setDoctorLoadFactors(result.loadFactors);
        }
      };
      fetchLoadFactors();
    }
  }, [doctors]);

  // Watch for note changes to enable analyzer automatically
  const note = form.watch("note");
  useEffect(() => {
    if (note && note.length > 5 && !showPriorityAnalyzer) {
      setShowPriorityAnalyzer(true);
    }
  }, [note]);

  // Watch form values
  const selectedDoctorId = form.watch("doctor_id");
  const selectedDate = form.watch("appointment_date");

  // Effect for fetching doctor working days
  useEffect(() => {
    const fetchDoctorWorkingDays = async () => {
      if (selectedDoctorId) {
        setLoadingWorkingDays(true);
        setAvailableTimes([]);
        form.setValue("time", "");
        
        try {
          const result = await getDoctorWorkingDays(selectedDoctorId);
          if (result.success && result.workingDays) {
            setDoctorWorkingDays(result.workingDays);
          } else {
            setDoctorWorkingDays([]);
          }
        } catch (error) {
          console.error('Error fetching doctor working days:', error);
          setDoctorWorkingDays([]);
        } finally {
          setLoadingWorkingDays(false);
        }
      } else {
        setDoctorWorkingDays([]);
        setAvailableTimes([]);
        setLoadingWorkingDays(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchDoctorWorkingDays();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedDoctorId, form]);

  // Effect for generating available times
  useEffect(() => {
    if (selectedDate && selectedDoctorId && doctorWorkingDays.length > 0) {
      try {
        const date = new Date(selectedDate);
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayOfWeek = dayNames[date.getDay()].toLowerCase();
        
        const workingDay = doctorWorkingDays.find(
          wd => wd.day.toLowerCase() === dayOfWeek
        );
        
        if (workingDay) {
          const times = generateDynamicTimes(workingDay.start_time, workingDay.close_time, 30);
          setAvailableTimes(times);
        } else {
          setAvailableTimes([]);
        }
      } catch (error) {
        console.error('Error generating available times:', error);
        setAvailableTimes([]);
      }
    } else {
      setAvailableTimes([]);
    }
    
    const currentTime = form.getValues("time");
    if (currentTime) {
      setTimeout(() => {
        const isTimeStillValid = availableTimes.some(time => time.value === currentTime);
        if (!isTimeStillValid) {
          form.setValue("time", "");
        }
      }, 50);
    }
  }, [selectedDate, selectedDoctorId, doctorWorkingDays, form]);

  // Effect to set form ready state
  useEffect(() => {
    setIsFormReady(!!selectedDoctorId);
  }, [selectedDoctorId]);

  const handlePriorityAssigned = async (
    level: PriorityLevel,
    score: number,
    suggestedDepartment: string,
    suggestedDoctorId: string,
    isOverride: boolean = false
  ) => {
    // Clear existing selections
    form.setValue("appointment_date", "");
    form.setValue("time", "");
    
    // Set priority and doctor
    form.setValue("priority_level", level);
    form.setValue("priority_score", score);
    form.setValue("doctor_id", suggestedDoctorId);
    form.setValue("priority_override", isOverride);
  
    setPriorityInfo({
      level,
      score,
      department: suggestedDepartment
    });
  
    // Reset states
    setDoctorWorkingDays([]);
    setAvailableTimes([]);
    setLoadingWorkingDays(true);
  
    // Immediately fetch working days for the selected doctor
    try {
      const result = await getDoctorWorkingDays(suggestedDoctorId);
      if (result.success && result.workingDays) {
        setDoctorWorkingDays(result.workingDays);
      } else {
        setDoctorWorkingDays([]);
      }
    } catch (error) {
      console.error('Error fetching priority doctor working days:', error);
      setDoctorWorkingDays([]);
    } finally {
      setLoadingWorkingDays(false);
    }
  
    setIsFormReady(true);
    toast.success(`Priority set to ${level} (Score: ${score})`);
  };

  const onSubmit: SubmitHandler<z.infer<typeof EnhancedAppointmentSchema>> = async (values) => {
    try {
      setIsSubmitting(true);
      
      const newData = { 
        ...values, 
        patient_id: patient?.id!,
        booked_by: nurseId,
        priority_level: values.priority_level,
        priority_score: values.priority_score,
        priorityAssessment: {
          create: {
            condition: values.note || "",
            appointment_type: values.type,
            priority_score: values.priority_score,
            priority_level: values.priority_level,
            notes: `Auto-assigned priority: ${values.priority_level} (Booked by ${nurseName})`,
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
          className="w-full flex items-center gap-2 justify-start text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 transition-all duration-200 rounded-lg px-4 py-2 border border-slate-600 hover:border-slate-500"
        >
          <Stethoscope size={16} className="text-blue-400" /> 
          Book for {patientName}
        </Button>
      </DialogTrigger>
  
      <DialogContent className="
  bg-slate-900 
  border-slate-700 
  text-slate-100 
  max-w-2xl 
  w-[100vw] 
  h-[100vh]
  sm:w-[95vw]
  sm:h-auto
  sm:max-h-[85vh]
  md:max-h-[80vh]
  shadow-xl
  sm:max-w-lg 
  md:max-w-xl 
  lg:max-w-2xl
  rounded-none
  sm:rounded-lg
  flex
  flex-col
  p-1
  sm:p-4
  md:p-6
  m-0
  sm:m-auto
  overflow-hidden
">



        {!loading && (
          <>
            {/* Header - Fixed */}
            <DialogHeader className="
  flex-shrink-0 
  border-b 
  border-slate-700 
  pb-1
  sm:pb-4 
  mb-1
  sm:mb-4
  px-1
  sm:px-0
">

<DialogTitle className="
  text-slate-100 
  text-lg
  sm:text-xl
  md:text-2xl
  font-semibold
  flex items-center gap-2
">

                <UserCheck className="h-6 w-6 text-blue-400" />
                Book Appointment for {patientName}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
                <Stethoscope className="h-4 w-4" />
                <span>Booking as {nurseName}</span>
              </div>
            </DialogHeader>
  
            {/* Scrollable Content */}
            <div className="
  flex-1 
  overflow-y-auto 
  px-1
  sm:px-0
  min-h-0
  scrollbar-thin 
  scrollbar-track-slate-800 
  scrollbar-thumb-slate-600 
  hover:scrollbar-thumb-slate-500
">

              <Form {...form}>
<form
  onSubmit={form.handleSubmit(onSubmit)}
  className="space-y-3 sm:space-y-6"
>

                  {/* Patient Info Section */}
                  <div className="
  w-full 
  rounded-md
  sm:rounded-lg 
  border 
  border-slate-700 
  bg-slate-800 
  p-2
  sm:p-4 
  flex 
  items-center 
  gap-2
  sm:gap-4
">


<ProfileImage
  url={patient?.img!}
  name={patientName}
  bgColor={patient?.colorCode!}
  className="size-12 sm:size-16 border-2 border-slate-600"
/>

                    <div className="flex-1">
                    <p className="font-semibold text-base sm:text-lg text-slate-100 mb-1">
  {patientName}
</p>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-300 capitalize bg-slate-700 px-2 py-1 rounded">
                          {patient?.gender}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                          <UserCheck className="h-3 w-3" />
                          <span>Nurse Booking</span>
                        </div>
                      </div>
                    </div>
                  </div>
  
                  {/* Appointment Type */}
                  <div className="space-y-1.5 sm:space-y-2">
                  <CustomInput
                      type="select"
                      selectList={TYPES}
                      control={form.control}
                      name="type"
                      label="Appointment Type"
                      placeholder="Select an appointment type"
                    />
                  </div>
                  
                  {/* Reason for Visit / Symptoms */}
                  <div className="space-y-1.5 sm:space-y-2">
                  <CustomInput
                      type="textarea"
                      control={form.control}
                      name="note"
                      placeholder="Describe patient's symptoms or reason for appointment..."
                      label="Patient Symptoms / Reason for Visit"
                    />
                  </div>
  
                  {/* Priority Analyzer */}
                  {showPriorityAnalyzer && (
 <div className="
 border 
 rounded-lg 
 p-3
 sm:p-4 
 bg-slate-800 
 border-slate-700
">
                      <h3 className="text-sm font-medium text-slate-200 mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Priority Analysis
                      </h3>
                      <AppointmentPriorityAnalyzer
                        patientId={patient.id}
                        appointmentNote={note || ""}
                        doctors={physicians || []}
                        onPriorityAssigned={handlePriorityAssigned}
                        doctorLoadFactors={doctorLoadFactors}
                      />
                    </div>
                  )}
  
                  {/* Enhanced Date and Time Selection */}
                  {priorityInfo && (
                    <div className="space-y-4">
                      {/* Priority Display */}
                      <div className={`
  p-3 
  rounded-lg 
  border 
  ${getPriorityClasses(priorityInfo.level).bg}
  ${getPriorityClasses(priorityInfo.level).border}
  flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3
`}>
                        {getPriorityClasses(priorityInfo.level).icon}
                        <div>
                          <p className={`font-medium ${getPriorityClasses(priorityInfo.level).text}`}>
                            Priority: {priorityInfo.level}
                          </p>
                          <p className="text-xs text-slate-400">
                            Score: {priorityInfo.score} | Department: {priorityInfo.department}
                          </p>
                        </div>
                      </div>
  
                      {selectedDoctorId && (
                        <div className="space-y-2">
                          {loadingWorkingDays ? (
                            <div className="text-xs text-slate-400 bg-slate-800 p-2 rounded flex items-center gap-2">
                              <div className="w-3 h-3 border border-slate-500 border-t-blue-400 rounded-full animate-spin"></div>
                              Loading doctor availability...
                            </div>
                          ) : doctorWorkingDays.length > 0 ? (
                            <div className="text-xs text-slate-400 bg-slate-800 p-2 rounded">
                              Available days: {doctorWorkingDays.map(wd => wd.day).join(', ')}
                            </div>
                          ) : (
                            <div className="text-xs text-amber-300 bg-amber-900/20 p-2 rounded border border-amber-800">
                              No working days set for this doctor. Please contact admin.
                            </div>
                          )}
                        </div>
                      )}
  
                      {/* Calendar Date Picker */}
                      <FormField
                        control={form.control}
                        name="appointment_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-slate-200 font-medium">
                              Appointment Date
                            </FormLabel>
                            <FormControl>
                              <CalendarDatePicker
                                value={field.value ? new Date(field.value) : undefined}
                                onChange={(date) => {
                                  field.onChange(formatDateWithUserTimezone(date));
                                }}
                                placeholder={
                                  loadingWorkingDays 
                                    ? "Loading doctor availability..." 
                                    : selectedDoctorId 
                                      ? "Select appointment date" 
                                      : "Select doctor first"
                                }
                                className="w-full"
                                selectedDoctorId={selectedDoctorId}
                                doctorWorkingDays={doctorWorkingDays}
                                disabled={loadingWorkingDays}
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
  
  <FormField
  control={form.control}
  name="time"
  render={({ field }) => (
    <FormItem>
      <FormControl>
        <TimeSlotSelector
          selectedDoctorId={selectedDoctorId}
          selectedDate={selectedDate}
          availableTimes={doctorWorkingDays.length > 0 && selectedDate ? (() => {
            try {
              const date = new Date(selectedDate);
              const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const dayOfWeek = dayNames[date.getDay()].toLowerCase();
              const workingDay = doctorWorkingDays.find(wd => wd.day.toLowerCase() === dayOfWeek);
              
              if (workingDay) {
                // Generate times using the same logic as your fixed version
                const times = [];
                const [startHour, startMin] = workingDay.start_time.split(':').map(Number);
                const [endHour, endMin] = workingDay.close_time.split(':').map(Number);
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;
                
                for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
                  const hour = Math.floor(minutes / 60);
                  const min = minutes % 60;
                  const period = hour >= 12 ? 'PM' : 'AM';
                  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                  const timeString = `${displayHour}:${min.toString().padStart(2, '0')} ${period}`;
                  
                  times.push({
                    label: timeString,
                    value: timeString
                  });
                }
                return times;
              }
              return [];
            } catch (error) {
              console.error('Error generating times:', error);
              return [];
            }
          })() : []}
          selectedTime={field.value}
          onTimeSelect={field.onChange}
          disabled={isSubmitting || loadingWorkingDays}
          patientId={patient.id}
        />
      </FormControl>
      <FormMessage className="text-red-400 text-sm mt-2" />
    </FormItem>
  )}
/>
                    </div>
                  )}
                </form>
              </Form>
            </div>
  
            {/* Footer - Fixed */}
            <div className="
  flex-shrink-0 
  border-t 
  border-slate-700 
  pt-1
  sm:pt-4 
  mt-1
  sm:mt-4
  px-1
  sm:px-0
  bg-slate-900
  sticky
  bottom-0
">
  
  <Button
  disabled={
    isSubmitting || 
    !form.formState.isValid || 
    !priorityInfo ||
    !form.watch("appointment_date") ||
    !form.watch("time")
  }
  type="submit"
  onClick={form.handleSubmit(onSubmit)}
  className={`
    w-full 
    font-semibold 
    py-2.5
    sm:py-3 
    text-sm
    sm:text-base
    rounded-lg 
    transition-all 
    duration-200
    ${
      priorityInfo?.level === PriorityLevel.EMERGENCY 
        ? 'bg-red-600 hover:bg-red-700 text-slate-100' :
      priorityInfo?.level === PriorityLevel.URGENT 
        ? 'bg-amber-600 hover:bg-amber-700 text-slate-100' :
      'bg-blue-600 hover:bg-blue-700 text-slate-100'
    }
    disabled:opacity-50 
    disabled:cursor-not-allowed 
    flex 
    items-center 
    justify-center 
    gap-2
  `}
>

                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-100 rounded-full animate-spin"></div>
                    Booking Appointment...
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-4 w-4" />
                    Book Appointment for {patientName}
                  </>
                )}
              </Button>
              
              {/* Form Status Indicators */}
              <div className="mt-2 sm:mt-3 text-xs text-slate-400 space-y-1">
              {!priorityInfo && (
                  <p className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Complete symptom description to analyze priority
                  </p>
                )}
                {priorityInfo && !form.watch("appointment_date") && (
                  <p className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Select appointment date
                  </p>
                )}
                {priorityInfo && form.watch("appointment_date") && !form.watch("time") && (
                  <p className="flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Select appointment time
                  </p>
                )}
                {form.formState.isValid && priorityInfo && form.watch("appointment_date") && form.watch("time") && (
                  <p className="flex items-center gap-1 text-emerald-400">
                    <UserCheck className="h-3 w-3" />
                    Ready to book appointment
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};