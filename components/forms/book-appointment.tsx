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
  
import { Button } from "../ui/button";
import { UserPen, Activity, AlertTriangle, HeartPulse } from "lucide-react";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { ProfileImage } from "../profile-image";
import { CustomInput } from "../custom-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { createNewAppointment } from "@/app/actions/appointment";
// import { DraggableDialogContent } from '../Draggable-Content'; // Commented out draggable
import AppointmentPriorityAnalyzer from '../AppointmentPriorityAnalyzer';
import { getDoctorLoadFactors } from '@/app/actions/doctor-load';
import { getDoctorWorkingDays } from '@/app/actions/doctor-schedule';

const EnhancedAppointmentSchema = AppointmentSchema.extend({
  priority_level: z.enum(['NORMAL', 'URGENT', 'EMERGENCY']).default('NORMAL'),
  priority_score: z.number().default(0),
  department: z.string().optional(),
  priority_override: z.boolean().default(false),
  // Better date handling
  appointment_date: z.string().min(1, "Select appointment date"),
});

// Appointment types
const TYPES = [
  { label: "General Consultation", value: "General Consultation" },
  { label: "General Check up", value: "General Check Up" },
  { label: "Antenatal", value: "Antenatal" },
  { label: "Maternity", value: "Maternity" },
  { label: "Emergency", value: "Emergency" },
];

interface EnhancedBookAppointmentProps {
  data: Patient;
  doctors: Doctor[];
  bookedBy?: string;
  isNurseBooking?: boolean;
  isNurse?: boolean;
  isAdmin?: boolean;
  isDoctor?: boolean;
  userId?: string | null;
}

// Dynamic timezone date formatting helper
const formatDateWithUserTimezone = (date: Date | undefined) => {
  if (!date) return "";
  
  // Simple local date formatting that preserves the selected date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

// Get user's timezone info for display/debugging
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
  
  // Parse start time (format: "07:00" or "7:00")
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  // Convert to minutes for easier calculation
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  // Generate times every intervalMinutes
  for (let minutes = startMinutes; minutes < endMinutes; minutes += intervalMinutes) {
    const hour = Math.floor(minutes / 60);
    const min = minutes % 60;
    
    // Format to 12-hour time
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

// Custom Calendar Date Picker Component with Dynamic Timezone
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
    
    // Disable dates beyond 3 months
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    maxDate.setHours(23, 59, 59, 999);
    
    if (checkDate > maxDate) return true;
    
    // If no doctor selected, allow all future dates
    if (!selectedDoctorId || !doctorWorkingDays || doctorWorkingDays.length === 0) {
      // Still disable past dates
      return checkDate < today;
    }
    
    // Get day name for the selected date
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = dayNames[checkDate.getDay()].toLowerCase();
    
    // Check if the day of the week is in doctor's working days
    const doctorWorkingDay = doctorWorkingDays.find(
      workingDay => workingDay.day.toLowerCase() === dayOfWeek
    );
    
    // If doctor doesn't work on this day, disable it
    if (!doctorWorkingDay) return true;
    
    // If it's a past date (not today), disable it
    if (checkDate < today) return true;
    
    // If it's today, check if current time is past doctor's closing time
    if (checkDate.getTime() === today.getTime()) {
      // Parse doctor's closing time
      const [closeHour, closeMinute] = doctorWorkingDay.close_time.split(':').map(Number);
      
      // Create a Date object for today's closing time
      const closingTime = new Date();
      closingTime.setHours(closeHour, closeMinute, 0, 0);
      
      // If current time is past closing time, disable today
      if (now >= closingTime) {
        return true;
      }
    }
    
    // Date is valid (future date or today before closing time, and doctor works on this day)
    return false;
  };

  return (
    <>
      <Button
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal bg-slate-800/80 border-emerald-600/40 text-slate-200 hover:bg-slate-700/80 hover:border-emerald-500/60 transition-all duration-200",
          !value && "text-slate-400",
          className
        )}
        disabled={disabled}
        type="button"
        onClick={() => setIsOpen(true)}
      >
        <CalendarIcon className="mr-2 h-4 w-4 text-emerald-400" />
        {value ? format(value, "PPP") : <span>{placeholder}</span>}
      </Button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-slate-900/95 border border-emerald-500/40 shadow-2xl rounded-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-emerald-400 font-medium">Select Date</h3>
                <p className="text-xs text-slate-400 mt-1">
                  {timezoneInfo.timezone} ({timezoneInfo.offset})
                  {timezoneInfo.isPhilippines && " 🇵🇭"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white"
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
                caption: "flex justify-center pt-1 relative items-center text-emerald-400",
                caption_label: "text-sm font-medium text-emerald-400",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-emerald-400 hover:bg-emerald-800/50 rounded-md transition-colors",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-emerald-300 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-normal text-slate-200 hover:bg-emerald-700/60 hover:text-emerald-100 rounded-md cursor-pointer transition-colors aria-selected:opacity-100",
                day_selected: "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white focus:bg-emerald-600 focus:text-white",
                day_today: "bg-slate-700/80 text-emerald-400 font-semibold",
                day_outside: "text-slate-500 opacity-50 aria-selected:bg-emerald-600/50 aria-selected:text-white aria-selected:opacity-30",
                day_disabled: "text-slate-600 opacity-30 cursor-not-allowed hover:bg-transparent",
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export const EnhancedBookAppointment = ({
  data,
  doctors,
  bookedBy,
  isNurseBooking = false,
}: EnhancedBookAppointmentProps) => {
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


  //const appointmentTimes = generateTimes(8, 17, 30);
  const patientName = `${data?.first_name} ${data?.last_name}`;

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
          bg: "bg-emerald-900/30",
          border: "border-emerald-500/50",
          text: "text-emerald-400",
          icon: <HeartPulse className="h-5 w-5 text-emerald-400" />
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

// Watch form values properly
const selectedDoctorId = form.watch("doctor_id");
const selectedDate = form.watch("appointment_date");

// Effect for fetching doctor working days
useEffect(() => {
  const fetchDoctorWorkingDays = async () => {
    if (selectedDoctorId) {
      setLoadingWorkingDays(true);
      setAvailableTimes([]); // Clear times immediately
      // Clear the time selection when doctor changes
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

  // Add a small delay to ensure form values are properly set
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
  
  // Reset time selection if it's no longer valid
  const currentTime = form.getValues("time");
  if (currentTime) {
    setTimeout(() => {
      const isTimeStillValid = availableTimes.some(time => time.value === currentTime);
      if (!isTimeStillValid) {
        form.setValue("time", "");
      }
    }, 50);
  }
}, [selectedDate, selectedDoctorId, doctorWorkingDays, form]); // Added availableTimes.length to dependencies

// Effect to set form ready state
useEffect(() => {
  setIsFormReady(!!selectedDoctorId);
}, [selectedDoctorId]);

const handlePriorityAssigned = (
  level: PriorityLevel,
  score: number,
  suggestedDepartment: string,
  suggestedDoctorId: string,
  isOverride: boolean = false
) => {
  // Clear existing date/time selections
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

  // Reset states to trigger fresh data fetch
  setDoctorWorkingDays([]);
  setAvailableTimes([]);
  setLoadingWorkingDays(true);
  
  // Force form to recognize the change and trigger effects
  setIsFormReady(true);

  toast.success(`Priority set to ${level} (Score: ${score})`);
};

// Effect to handle doctor selection from priority analyzer
useEffect(() => {
  const priorityLevel = form.watch("priority_level");
  const doctorId = form.watch("doctor_id");
  
  // If priority is set and doctor is selected (likely from analyzer)
  if (priorityLevel && priorityLevel !== PriorityLevel.NORMAL && doctorId && priorityInfo) {
    // Ensure working days are fetched for the selected doctor
    const fetchWorkingDaysForPriorityDoctor = async () => {
      setLoadingWorkingDays(true);
      try {
        const result = await getDoctorWorkingDays(doctorId);
        if (result.success && result.workingDays) {
          setDoctorWorkingDays(result.workingDays);
        }
      } catch (error) {
        console.error('Error fetching priority doctor working days:', error);
      } finally {
        setLoadingWorkingDays(false);
      }
    };
    
    fetchWorkingDaysForPriorityDoctor();
  }
}, [form.watch("priority_level"), form.watch("doctor_id"), priorityInfo]);

  const onSubmit: SubmitHandler<z.infer<typeof EnhancedAppointmentSchema>> = async (
    values
  ) => {
    try {
      setIsSubmitting(true);
      
      const newData = { 
        ...values, 
        patient_id: data?.id!,
        booked_by: bookedBy || null,
        priority_level: values.priority_level,
        priority_score: values.priority_score,
        priorityAssessment: {
          create: {
            condition: values.note || "",
            appointment_type: values.type,
            priority_score: values.priority_score,
            priority_level: values.priority_level,
            notes: `Auto-assigned priority: ${values.priority_level}${bookedBy ? ` (Booked by nurse)` : ''}`,
            patient_id: data?.id!
          }
        }
      };

      const res = await createNewAppointment(newData);

      if (res.success) {
        form.reset({});
        setPriorityInfo(null);
        setShowPriorityAnalyzer(false);
        router.refresh();
        toast.success(
          isNurseBooking 
            ? `Appointment booked successfully for ${patientName}` 
            : "Appointment created successfully"
        );
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
          className="w-full flex items-center gap-2 justify-start text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 rounded-lg px-4 py-2"
        >
          <UserPen size={16} /> 
          {isNurseBooking ? `Book for ${patientName}` : 'Book Appointment'}
        </Button>
      </DialogTrigger>

      {/* Updated DialogContent with proper scrolling */}
      <DialogContent className="
        bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
        border-emerald-600/30 
        text-slate-100 
        max-w-2xl 
        w-[95vw] 
        max-h-[95vh] 
        shadow-2xl 
        shadow-emerald-900/20
        sm:max-w-lg 
        md:max-w-xl 
        lg:max-w-2xl
        rounded-2xl
        flex
        flex-col
      ">
        {!loading && (
          <>
            {/* Header - Fixed */}
            <DialogHeader className="
              flex-shrink-0 
              border-b 
              border-emerald-600/20 
              pb-4 
              mb-4
            ">
              <DialogTitle className="
                text-emerald-400 
                text-xl 
                font-semibold 
                tracking-wide
                sm:text-2xl
              ">
                {isNurseBooking ? `Book Appointment for ${patientName}` : 'Book Appointment'}
              </DialogTitle>
              {isNurseBooking && (
                <div className="text-sm text-emerald-300/70 mt-1">
                  Booking as nurse
                </div>
              )}
            </DialogHeader>

            {/* Scrollable Content */}
            <div className="
              flex-1 
              overflow-y-auto 
              pr-2
              min-h-0
              scrollbar-thin 
              scrollbar-track-slate-800/50 
              scrollbar-thumb-emerald-600/50 
              hover:scrollbar-thumb-emerald-500/70
            ">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Patient Info Section */}
                  <div className="
                    w-full 
                    rounded-xl 
                    border 
                    border-emerald-600/30 
                    bg-gradient-to-r from-emerald-950/30 to-slate-800/30 
                    p-4 
                    flex 
                    items-center 
                    gap-4
                    shadow-lg
                  ">
                    <ProfileImage
                      url={data?.img!}
                      name={patientName}
                      bgColor={data?.colorCode!}
                      className="size-16 border-2 border-emerald-500/40 shadow-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-slate-100 mb-1">
                        {patientName}
                      </p>
                      <span className="text-sm text-emerald-300/80 capitalize bg-emerald-950/30 px-2 py-1 rounded-md">
                        {data?.gender}
                      </span>
                    </div>
                  </div>

                  {/* Appointment Type */}
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <CustomInput
                      type="textarea"
                      control={form.control}
                      name="note"
                      placeholder="Describe symptoms or reason for appointment..."
                      label="Reason for Visit / Symptoms"
                    />
                  </div>

                  {/* Priority Analyzer */}
                  {showPriorityAnalyzer && (
                    <div className="
                      border 
                      rounded-xl 
                      p-4 
                      bg-gradient-to-br from-slate-800/60 to-emerald-950/20 
                      border-emerald-600/30
                      shadow-lg
                    ">
                      <h3 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Priority Analysis
                      </h3>
                      <AppointmentPriorityAnalyzer
                        patientId={data.id}
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
                        rounded-xl 
                        border 
                        ${getPriorityClasses(priorityInfo.level).bg}
                        ${getPriorityClasses(priorityInfo.level).border}
                        flex items-center gap-3
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
      <div className="text-xs text-blue-300/70 bg-blue-950/30 p-2 rounded-lg flex items-center gap-2">
        <div className="w-3 h-3 border border-blue-400/50 border-t-blue-400 rounded-full animate-spin"></div>
        Loading doctor availability...
      </div>
    ) : doctorWorkingDays.length > 0 ? (
      <div className="text-xs text-emerald-300/70 bg-emerald-950/30 p-2 rounded-lg">
        Available days: {doctorWorkingDays.map(wd => wd.day).join(', ')}
      </div>
    ) : (
      <div className="text-xs text-amber-300/70 bg-amber-950/30 p-2 rounded-lg">
        No working days set for this doctor. Please contact admin.
      </div>
    )}
  </div>
)}

                      {/* Calendar Date Picker with Dynamic Timezone */}
                      <FormField
                        control={form.control}
                        name="appointment_date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-emerald-400 font-medium">
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
                      
                      {/* Enhanced Time Selection Grid */}
<FormField
  control={form.control}
  name="time"
  render={({ field }) => (
    <FormItem>
      <FormLabel className="text-emerald-400 font-medium text-base mb-3 block">
        Select Time Slot
      </FormLabel>
      <FormControl>
        <div className="space-y-4">
          {availableTimes.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableTimes.map((timeSlot) => (
                <button
                  key={timeSlot.value}
                  type="button"
                  onClick={() => field.onChange(timeSlot.value)}
                  className={`
                    relative
                    px-4 py-3
                    rounded-lg
                    border-2
                    font-medium
                    text-sm
                    transition-all duration-200
                    hover:scale-105
                    focus:outline-none
                    focus:ring-2
                    focus:ring-emerald-400/50
                    ${field.value === timeSlot.value
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-800/60 border-slate-600/50 text-slate-200 hover:bg-slate-700/80 hover:border-emerald-500/40 hover:text-emerald-100'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold">
                      {timeSlot.label}
                    </span>
                    {field.value === timeSlot.value && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4">
              <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-6">
                <div className="text-slate-400 mb-2">
                  <svg className="w-8 h-8 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {!selectedDoctorId ? (
                    <p className="text-sm">Please select a doctor first</p>
                  ) : !form.watch("appointment_date") ? (
                    <p className="text-sm">Please select a date first</p>
                  ) : (
                    <p className="text-sm">No available time slots for this day</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Working Hours Info */}
          {selectedDoctorId && form.watch("appointment_date") && doctorWorkingDays.length > 0 && (
            <div className="bg-emerald-950/30 border border-emerald-600/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-emerald-300/80">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium">
                  {(() => {
                    const selectedDate = form.watch("appointment_date");
                    const date = new Date(selectedDate);
                    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                    const dayOfWeek = dayNames[date.getDay()].toLowerCase();
                    const workingDay = doctorWorkingDays.find(wd => wd.day.toLowerCase() === dayOfWeek);
                    
                    return workingDay 
                      ? `Working hours: ${workingDay.start_time} - ${workingDay.close_time}`
                      : "Doctor not available on this day";
                  })()}
                </span>
              </div>
            </div>
          )}
        </div>
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
            <div className="flex-shrink-0 pt-4 border-t border-emerald-600/20">
              <Button
                disabled={isSubmitting || !form.formState.isValid || !priorityInfo}
                onClick={form.handleSubmit(onSubmit)}
                className={`
                  w-full 
                  py-3 
                  font-medium 
                  text-white 
                  rounded-xl 
                  shadow-lg 
                  transition-all 
                  duration-200
                  disabled:opacity-50 
                  disabled:cursor-not-allowed
                  ${priorityInfo?.level === PriorityLevel.EMERGENCY 
                    ? 'bg-red-600 hover:bg-red-700 shadow-red-500/25' :
                    priorityInfo?.level === PriorityLevel.URGENT 
                    ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/25' :
                    'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                  }
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </div>
                ) : (
                  'Book Appointment'
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedBookAppointment;