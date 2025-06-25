"use client";
/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface TimeSlot {
  label: string;
  value: string;
  isAvailable: boolean;
  appointmentCount?: number;
}

interface BookedAppointment {
  id: number;
  time: string;
  status: 'PENDING' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  patient_name?: string;
  priority_level: 'NORMAL' | 'URGENT' | 'EMERGENCY';
}

interface TimeSlotSelectorProps {
  selectedDoctorId: string;
  selectedDate: string;
  availableTimes: { label: string; value: string }[];
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  disabled?: boolean;
  patientId?: string; // To exclude current patient's appointments if rescheduling
}

// Server action to fetch booked appointments
const getBookedAppointments = async (
  doctorId: string, 
  date: string
): Promise<{ success: boolean; appointments: BookedAppointment[] }> => {
  try {
    const response = await fetch('/api/appointments/booked', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        doctorId,
        date,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }

    const data = await response.json();
    return { success: true, appointments: data.appointments || [] };
  } catch (error) {
    console.error('Error fetching booked appointments:', error);
    return { success: false, appointments: [] };
  }
};

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({
  selectedDoctorId,
  selectedDate,
  availableTimes,
  selectedTime,
  onTimeSelect,
  disabled = false,
  patientId
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookedAppointments, setBookedAppointments] = useState<BookedAppointment[]>([]);

  // Fetch booked appointments when doctor or date changes
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedDoctorId || !selectedDate || availableTimes.length === 0) {
        setTimeSlots([]);
        return;
      }

      setLoading(true);
      try {
        const result = await getBookedAppointments(selectedDoctorId, selectedDate);
        
        if (result.success) {
          setBookedAppointments(result.appointments);
          
          // Process available times with booking status
          const processedSlots: TimeSlot[] = availableTimes.map(time => {
            const bookedSlot = result.appointments.find(
              apt => apt.time === time.value && 
              ['PENDING', 'SCHEDULED'].includes(apt.status) // Only consider active appointments
            );
            
            return {
              label: time.label,
              value: time.value,
              isAvailable: !bookedSlot,
              appointmentCount: result.appointments.filter(
                apt => apt.time === time.value && 
                ['PENDING', 'SCHEDULED'].includes(apt.status)
              ).length
            };
          });
          
          setTimeSlots(processedSlots);
        } else {
          // If fetch fails, assume all slots are available
          const fallbackSlots: TimeSlot[] = availableTimes.map(time => ({
            label: time.label,
            value: time.value,
            isAvailable: true,
            appointmentCount: 0
          }));
          
          setTimeSlots(fallbackSlots);
          toast.error('Could not verify slot availability. Please check with staff.');
        }
      } catch (error) {
        console.error('Error processing time slots:', error);
        toast.error('Error loading time slot availability');
      } finally {
        setLoading(false);
      }
    };

    fetchBookedSlots();
  }, [selectedDoctorId, selectedDate, availableTimes]);

  // Handle time slot selection
  const handleSlotClick = (slot: TimeSlot) => {
    if (disabled || !slot.isAvailable) {
      if (!slot.isAvailable) {
        toast.error('This time slot is already booked');
      }
      return;
    }
    
    onTimeSelect(slot.value);
  };

  // Get slot styling based on availability and selection
  const getSlotStyling = (slot: TimeSlot) => {
    const isSelected = selectedTime === slot.value;
    
    if (!slot.isAvailable) {
      return {
        className: `
          px-4 py-3 rounded-lg border-2 font-medium text-sm
          bg-red-900/30 border-red-500/50 text-red-300
          cursor-not-allowed opacity-60
          relative overflow-hidden
        `,
        icon: <AlertCircle className="w-4 h-4 text-red-400" />
      };
    }
    
    if (isSelected) {
      return {
        className: `
          px-4 py-3 rounded-lg border-2 font-medium text-sm
          bg-emerald-600 border-emerald-500 text-white 
          shadow-lg shadow-emerald-500/25 scale-105
          transition-all duration-200 cursor-pointer
          hover:bg-emerald-700
        `,
        icon: <CheckCircle2 className="w-4 h-4 text-white" />
      };
    }
    
    return {
      className: `
        px-4 py-3 rounded-lg border-2 font-medium text-sm
        bg-slate-800/60 border-slate-600/50 text-slate-200
        hover:bg-slate-700/80 hover:border-emerald-500/40 hover:text-emerald-100
        hover:scale-105 transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-emerald-400/50
      `,
      icon: <Clock className="w-4 h-4 text-slate-400" />
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Checking slot availability...</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {availableTimes.map((_, index) => (
            <div
              key={index}
              className="px-4 py-3 rounded-lg border-2 border-slate-600/30 bg-slate-800/30 animate-pulse"
            >
              <div className="h-4 bg-slate-600/50 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No time slots available
  if (timeSlots.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-6">
          <Clock className="w-8 h-8 mx-auto mb-3 opacity-50 text-slate-400" />
          <div className="text-slate-400 mb-2">
            {!selectedDoctorId ? (
              <p className="text-sm">Please select a doctor first</p>
            ) : !selectedDate ? (
              <p className="text-sm">Please select a date first</p>
            ) : (
              <p className="text-sm">No available time slots for this day</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with availability info */}
      <div className="flex items-center justify-between">
        <h3 className="text-emerald-400 font-medium text-base">
          Select Time Slot
        </h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-600 rounded-full"></div>
            <span className="text-slate-400">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-slate-400">Booked</span>
          </div>
        </div>
      </div>

      {/* Time slots grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {timeSlots.map((slot) => {
          const styling = getSlotStyling(slot);
          
          return (
            <button
              key={slot.value}
              type="button"
              onClick={() => handleSlotClick(slot)}
              disabled={disabled || !slot.isAvailable}
              className={styling.className}
              title={
                !slot.isAvailable 
                  ? 'This time slot is already booked' 
                  : `Select ${slot.label}`
              }
            >
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  {styling.icon}
                  <span className="font-semibold">
                    {slot.label}
                  </span>
                </div>
                
                {/* Selected indicator */}
                {selectedTime === slot.value && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
                
                {/* Booked indicator */}
                {!slot.isAvailable && (
                  <div className="absolute inset-0 bg-red-500/10 rounded-lg">
                    <div className="absolute top-1 right-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Booking summary */}
      {bookedAppointments.length > 0 && (
        <div className="bg-slate-800/40 border border-slate-600/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-300 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">
              {bookedAppointments.length} appointment(s) already scheduled for this day
            </span>
          </div>
          
          {/* Show booked times */}
          <div className="text-xs text-slate-400">
            Booked times: {bookedAppointments
              .filter(apt => ['PENDING', 'SCHEDULED'].includes(apt.status))
              .map(apt => apt.time)
              .join(', ')}
          </div>
        </div>
      )}

      {/* Working hours info */}
      {selectedDoctorId && selectedDate && timeSlots.length > 0 && (
        <div className="bg-emerald-950/30 border border-emerald-600/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-emerald-300/80">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">
              Available slots: {timeSlots.filter(slot => slot.isAvailable).length} of {timeSlots.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlotSelector;