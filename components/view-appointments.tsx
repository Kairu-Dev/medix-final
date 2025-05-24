//Genshin Aesthetics - Glowing Stripes

import { getAppointmentById } from '@/utils/services/appointment';
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

import { Button } from './ui/button';
import { calculateAge, formatDateTime } from '@/utils';
import { ProfileImage } from './profile-image';
import { Calendar, Phone, User, Clock, AlertTriangle, Activity, HeartPulse, Stethoscope, UserCog, FileText, Goal } from 'lucide-react';
import { format } from 'date-fns';
import AppointmentStatusIndicator from './appointment-status-indicator';
import { checkRole } from '@/utils/roles';
import { auth } from '@clerk/nextjs/server';
import { AppointmentAction } from './appointment-action';
 /* eslint-disable */

// Helper function to get today's working hours
const getTodaysWorkingHours = (workingDays: any[]) => {
  const today = new Date();
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayName = dayNames[today.getDay()];
  
  const todaysSchedule = workingDays?.find(day => 
    day.day.toLowerCase() === todayName
  );
  
  return todaysSchedule;
};

export const ViewAppointment = async ({ id }: { id: string | undefined }) => {
    const {data} = await getAppointmentById(Number(id!));
    const {userId} = await auth()

    if(!data) return null

    // Priority level styling
    const getPriorityStyle = (level: string) => {
      switch(level) {
        case 'EMERGENCY':
          return {
            bg: 'bg-red-900/20',
            border: 'border-red-500/40',
            text: 'text-red-400',
            icon: <AlertTriangle className="h-4 w-4" />
          };
        case 'URGENT':
          return {
            bg: 'bg-amber-900/20',
            border: 'border-amber-500/40',
            text: 'text-amber-400',
            icon: <Activity className="h-4 w-4" />
          };
        default:
          return {
            bg: 'bg-emerald-900/20',
            border: 'border-emerald-500/40',
            text: 'text-emerald-400',
            icon: <HeartPulse className="h-4 w-4" />
          };
      }
    };

    const priorityStyle = getPriorityStyle(data.priority_level);

  return (
    <Dialog>
        <DialogTrigger asChild>
            <Button
            variant="outline"
            className="flex items-center justify-center rounded-full bg-cyan-400 hover:bg-cyan-700 text-slate-900 font-medium px-4 py-1.5 text-xs md:text-sm transition-colors duration-200 border-2 border-cyan-900 shadow-md"
            >
            View
            </Button>
        </DialogTrigger>

        <DialogContent className="shad-dialog max-w-[452px] max-h-[95%] md:max-w-3xl 2xl:max-w-4xl p-0 bg-gradient-to-br from-slate-900 to-blue-950 border border-cyan-500/30 shadow-2xl rounded-xl overflow-y-auto remove-scrollbar"> 
            <>
              <DialogHeader className="bg-gradient-to-r from-blue-950/90 to-slate-900/90 p-6 rounded-t-lg border-b border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(54,238,255,0.6)]"></div>
                    <div>
                      <DialogTitle className="text-2xl font-bold text-cyan-100 tracking-wider">Patient Appointment Details</DialogTitle>
                      <DialogDescription className="text-cyan-200/70 mt-1 italic">
                        Scheduled on {formatDateTime(data?.created_at.toString())}
                      </DialogDescription>
                    </div>
                  </div>
                  {/* Priority Badge */}
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${priorityStyle.bg} ${priorityStyle.border} border`}>
                    {priorityStyle.icon}
                    <span className={`text-sm font-medium ${priorityStyle.text}`}>
                      {data.priority_level}
                    </span>
                    {data.priority_score > 0 && (
                      <span className={`text-xs ${priorityStyle.text} opacity-70`}>
                        ({data.priority_score})
                      </span>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="p-6 bg-gradient-to-b from-slate-900/95 to-blue-950/95 relative">
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 opacity-5 pointer-events-none" 
                     style={{backgroundImage: 'radial-gradient(circle at 25% 25%, cyan 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                
                {/* Cancellation Notice */}
                {data?.status === "CANCELLED" && (
                  <div className="bg-red-950/30 border border-red-500/40 p-4 rounded-lg mb-6 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      <span className="font-semibold text-red-300">
                        Appointment Cancelled
                      </span>
                    </div>
                    <p className="text-red-200/80 text-sm">
                      <strong>Reason:</strong> {data?.reason || 'No reason provided'}
                    </p>
                  </div>
                )}

                <div className="space-y-8">
                  {/* Patient Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(54,238,255,0.6)]"></div>
                      <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent text-lg font-semibold tracking-wider">
                        Patient Information
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Patient Details */}
                      <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/30 p-5 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-4 mb-4">
                          <ProfileImage 
                            url={data?.patient?.img!}
                            name={data?.patient?.first_name + " " + data?.patient?.last_name}
                            className="size-16 bg-cyan-600 ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-slate-900 rounded-full shadow-[0_0_15px_rgba(54,238,255,0.3)]"
                            textClassName="text-xl font-bold"
                          />
                          <div className="space-y-1">
                            <h3 className="text-xl font-bold text-cyan-100 tracking-wide">
                              {data?.patient?.first_name + " " + data?.patient?.last_name}
                            </h3>
                            <p className="text-cyan-300/60 text-sm">ID: {data?.patient?.id}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Calendar className="h-4 w-4 text-cyan-400" />
                            <span>{calculateAge(data?.patient?.date_of_birth)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300">
                            <User className="h-4 w-4 text-cyan-400" />
                            <span className="capitalize">{data?.patient?.gender}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300 col-span-2">
                            <Phone className="h-4 w-4 text-cyan-400" />
                            <span>{data?.patient?.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Patient Address */}
                      <div className="bg-gradient-to-br from-slate-800/50 to-blue-900/30 p-5 rounded-xl border border-cyan-500/20 backdrop-blur-sm">
                        <h4 className="text-cyan-400 font-medium mb-3">Contact Information</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-cyan-300/70 block mb-1">Address</span>
                            <p className="text-slate-300 capitalize leading-relaxed">{data?.patient?.address}</p>
                          </div>
                          <div>
                            <span className="text-cyan-300/70 block mb-1">Email</span>
                            <p className="text-slate-300">{data?.patient?.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-1 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                      <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent text-lg font-semibold tracking-wider">
                        Appointment Details
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-indigo-950/40 to-indigo-900/20 p-4 rounded-lg border border-indigo-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-indigo-400" />
                          <span className="text-indigo-300/80 text-sm">Date</span>
                        </div>
                        <p className="text-indigo-100 font-medium">{format(data?.appointment_date, "MMM dd, yyyy")}</p>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-950/40 to-indigo-900/20 p-4 rounded-lg border border-indigo-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-indigo-400" />
                          <span className="text-indigo-300/80 text-sm">Time</span>
                        </div>
                        <p className="text-indigo-100 font-medium">{data?.time}</p>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-950/40 to-indigo-900/20 p-4 rounded-lg border border-indigo-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-indigo-400" />
                          <span className="text-indigo-300/80 text-sm">Type</span>
                        </div>
                        <p className="text-indigo-100 font-medium">{data?.type}</p>
                      </div>

                      <div className="bg-gradient-to-br from-indigo-950/40 to-indigo-900/20 p-4 rounded-lg border border-indigo-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-4 w-4 text-indigo-400" />
                          <span className="text-indigo-300/80 text-sm">Status</span>
                        </div>
                        <AppointmentStatusIndicator status={data?.status} />
                      </div>
                    </div>

                    {/* Patient Notes */}
                    {data?.note && (
                      <div className="bg-gradient-to-br from-blue-950/30 to-slate-900/30 p-5 rounded-lg border border-blue-500/20 backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="h-4 w-4 text-blue-400" />
                          <span className="text-blue-300 font-medium">Patient Notes / Symptoms</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed italic">{data?.note}</p>
                      </div>
                    )}
                  </div>

{/* Healthcare Team Section */}
<div className="space-y-4">
  <div className="flex items-center gap-2">
    <div className="h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
    <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent text-lg font-semibold tracking-wider">
      Healthcare Team
    </span>
  </div>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Attending Physician - Enhanced */}
    <div className="bg-gradient-to-br from-emerald-950/40 to-emerald-900/20 p-5 rounded-xl border border-emerald-500/20 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <Stethoscope className="h-5 w-5 text-emerald-400" />
        <span className="text-emerald-300 font-medium">Attending Physician</span>
        {data?.doctor?.availability_status && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            data.doctor.availability_status === 'AVAILABLE' 
              ? 'bg-green-900/40 text-green-300 border border-green-500/30' 
              : 'bg-red-900/40 text-red-300 border border-red-500/30'
          }`}>
            {data.doctor.availability_status.toLowerCase()}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <ProfileImage
          url={data?.doctor?.img!}
          name={data?.doctor?.name}
          className="size-14 bg-emerald-600 ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-slate-900 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          textClassName="text-lg font-bold"
        />
        <div className="space-y-1">
          <h4 className="text-lg font-semibold text-emerald-100 tracking-wide">
            {data?.doctor?.name}
          </h4>
          <p className="text-emerald-300/70 capitalize text-sm">
            {data?.doctor?.specialization}
          </p>
          {data?.doctor?.department && (
            <p className="text-emerald-400/60 text-xs">
              {data?.doctor?.department}
            </p>
          )}
          {data?.doctor?.license_number && (
            <p className="text-emerald-400/50 text-xs">
              License: {data?.doctor?.license_number}
            </p>
          )}
        </div>
      </div>

      {/* Doctor Contact Info */}
      {data?.doctor?.phone && (
        <div className="flex items-center gap-2 mb-3 text-sm">
          <Phone className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-200">{data?.doctor?.phone}</span>
        </div>
      )}

      {/* Today's Working Hours */}
      {(() => {
        const todaysHours = getTodaysWorkingHours(data?.doctor?.working_days || []);
        return todaysHours ? (
          <div className="bg-emerald-900/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">Today's Hours</span>
            </div>
            <p className="text-emerald-200 text-sm">
              {todaysHours.day}: {todaysHours.start_time} - {todaysHours.close_time}
            </p>
          </div>
        ) : (
          <div className="bg-emerald-900/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span className="text-emerald-300 text-sm font-medium">Today's Hours</span>
            </div>
            <p className="text-emerald-200/60 text-sm">Not available today</p>
          </div>
        );
      })()}
    </div>

    {/* Booking Information */}
    <div className="bg-gradient-to-br from-purple-950/40 to-purple-900/20 p-5 rounded-xl border border-purple-500/20 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-4">
        <UserCog className="h-5 w-5 text-purple-400" />
        <span className="text-purple-300 font-medium">Booking Information</span>
      </div>
      
      {data?.bookedByStaff ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <ProfileImage
              url={data?.bookedByStaff?.img!}
              name={data?.bookedByStaff?.name}
              className="size-12 bg-purple-600 ring-2 ring-purple-400/50 ring-offset-2 ring-offset-slate-900 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.3)]"
              textClassName="text-sm font-bold"
            />
            <div>
              <h5 className="text-purple-100 font-medium">
                {data?.bookedByStaff?.name}
              </h5>
              <p className="text-purple-300/70 text-sm capitalize">
                {data?.bookedByStaff?.role.toLowerCase()}
              </p>
            </div>
          </div>
          <div className="bg-purple-900/30 p-3 rounded-lg">
            <p className="text-purple-200/80 text-sm">
              <span className="text-purple-300">Booked by:</span> {data?.bookedByStaff?.name}
            </p>
            <p className="text-purple-200/60 text-xs mt-1">
              Department: {data?.bookedByStaff?.department || 'Not specified'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-purple-900/30 p-4 rounded-lg text-center">
          <User className="h-8 w-8 text-purple-400 mx-auto mb-2" />
          <p className="text-purple-200 text-sm">Self-booked by patient</p>
          <p className="text-purple-300/60 text-xs mt-1">Direct patient booking</p>
        </div>
      )}
    </div>
  </div>
</div>

                  {/* Priority Assessment */}
                  {data?.priorityAssessment && (
                    <div className="bg-gradient-to-br from-amber-950/30 to-amber-900/20 p-5 rounded-lg border border-amber-500/20 backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Goal className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-300 font-medium">Priority Assessment</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-300">
                          <span className="text-amber-300">Score:</span> {data?.priorityAssessment?.priority_score}/100
                        </p>
                        {data?.priorityAssessment?.notes && (
                          <p className="text-slate-300">
                            <span className="text-amber-300">Notes:</span> {data?.priorityAssessment?.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Appointment Guidelines & Preparation */}
<div className="space-y-4">
  <div className="flex items-center gap-2">
    <div className="h-6 w-1 bg-teal-400 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
    <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent text-lg font-semibold tracking-wider">
      Appointment Guidelines
    </span>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* What to Bring */}
    <div className="bg-gradient-to-br from-teal-950/30 to-teal-900/20 p-4 rounded-lg border border-teal-500/20 backdrop-blur-sm">
      <h4 className="text-teal-300 font-medium mb-3 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        What to Bring
      </h4>
      <ul className="space-y-2 text-sm text-slate-300">
        <li className="flex items-start gap-2">
          <span className="text-teal-400 mt-1">•</span>
          <span>Valid ID and insurance card</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-teal-400 mt-1">•</span>
          <span>List of current medications</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-teal-400 mt-1">•</span>
          <span>Previous medical records (if applicable)</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-teal-400 mt-1">•</span>
          <span>Payment method or co-pay</span>
        </li>
      </ul>
    </div>

    {/* Important Reminders */}
    <div className="bg-gradient-to-br from-teal-950/30 to-teal-900/20 p-4 rounded-lg border border-teal-500/20 backdrop-blur-sm">
      <h4 className="text-teal-300 font-medium mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Important Reminders
      </h4>
      <ul className="space-y-2 text-sm text-slate-300">
        <li className="flex items-start gap-2">
          <span className="text-teal-400 mt-1">•</span>
          <span>Arrive 15 minutes early for check-in</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-teal-400 mt-1">•</span>
          <span>Wear comfortable, loose-fitting clothing</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-teal-400 mt-1">•</span>
          <span>Bring a list of questions or concerns</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-teal-400 mt-1">•</span>
          <span>Inform us of any changes in symptoms</span>
        </li>
      </ul>
    </div>
  </div>
</div>

                  {/* Admin Actions Section */}
                  {((await checkRole("ADMIN")) || data?.doctor_id === userId) && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-1 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.6)]"></div>
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent text-lg font-semibold tracking-wider">
                          Administrative Actions
                        </span>
                      </div>
                      <div className="bg-gradient-to-br from-purple-950/30 to-purple-900/20 p-5 rounded-lg border border-purple-500/20 backdrop-blur-sm">
                        <AppointmentAction id={data.id} status={data?.status} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
        </DialogContent>
    </Dialog>
  )
}

export default ViewAppointment

{/* 

  Version before change

  import { getAppointmentById } from '@/utils/services/appointment';
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

import { Button } from './ui/button';
import { calculateAge, formatDateTime } from '@/utils';
import { ProfileImage } from './profile-image';
import { Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import AppointmentStatusIndicator from './appointment-status-indicator';
import { checkRole } from '@/utils/roles';
import { auth } from '@clerk/nextjs/server';
import { AppointmentAction } from './appointment-action';

export const ViewAppointment = async ({ id }: { id: string | undefined }) => {
  const {data} = await getAppointmentById(Number(id!));
  const {userId} = await auth()

  if(!data) return null

return (
  <Dialog>
      <DialogTrigger asChild>
          <Button
          variant="outline"
          className="flex items-center justify-center rounded-full bg-cyan-400 hover:bg-cyan-700 text-slate-900 font-medium px-4 py-1.5 text-xs md:text-sm transition-colors duration-200 border-2 border-cyan-900 shadow-md"
          >
          View
          </Button>
      </DialogTrigger>

      <DialogContent className="shad-dialog max-w-[452px] max-h-[95%] md:max-w-2xl 2xl:max-w-3xl p-0 bg-gradient-to-br from-slate-900 to-blue-950 border-2 border-cyan-500/50 shadow-xl rounded-xl overflow-y-auto remove-scrollbar"> 
          <>
            <DialogHeader className="bg-gradient-to-r from-blue-950 to-blue-900 p-6 rounded-t-lg border-b border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="h-8 w-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(54,238,255,0.6)]"></div>
                <DialogTitle className="text-2xl font-bold text-cyan-100 tracking-wider">Patient Appointment Details</DialogTitle>
              </div>
              <DialogDescription className="text-cyan-200/70 mt-2 ml-4 italic">
                Scheduled on {formatDateTime(data?.created_at.toString())}
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 bg-gradient-to-b from-blue-950/90 to-slate-950 bg-opacity-90 relative ">
              {/* Subtle constellation pattern overlay 
              <div className="absolute inset-0 acer-bg opacity-5 pointer-events-none mix-blend-screen"></div>
              
              {data?.status === "CANCELLED" && (
                <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg mb-6">
                  <span className="font-semibold text-red-300 block mb-1">
                    This appointment has been cancelled
                  </span>
                  <p className="text-gray-300 text-sm">
                    <strong>Reason:</strong> {data?.reason}
                  </p>
                </div>
              )}

              <div className="grid gap-6">
                {/* Personal Information Section 
                <div className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(54,238,255,0.6)]"></div>
                    <span className="inline-block bg-cyan-900/30 text-cyan-300 py-1 px-6 rounded-full text-lg font-medium border border-cyan-800/50 shadow-inner tracking-wider">
                      Personal Information
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mb-4">
                  <div className="flex gap-4 w-full md:w-1/2 items-center">
                    <div className="flex-shrink-0">
                      <ProfileImage 
                        url={data?.patient?.img!}
                        name={data?.patient?.first_name + " " + data?.patient?.last_name}
                        className="size-16 bg-cyan-600 ring-2 ring-cyan-400 ring-offset-2 ring-offset-blue-950 !rounded-full overflow-hidden aspect-square shadow-[0_0_15px_rgba(54,238,255,0.4)]"
                        textClassName="text-xl font-bold"
                      />
                    </div>
                    
                    <div className="space-y-1"> 
                      <h2 className="text-lg md:text-xl font-bold text-cyan-100 uppercase tracking-wider">
                        {data?.patient?.first_name + " " + data?.patient?.last_name}
                      </h2>
                      <p className="text-cyan-300/70 text-sm">Patient ID: {data?.patient?.id}</p>

                      <p className="flex items-center gap-2 text-slate-300">
                        <Calendar size={16} className="text-cyan-400" />
                        {calculateAge(data?.patient?.date_of_birth)}
                      </p>

                      <span className="flex items-center text-slate-300 gap-2">
                        <Phone size={16} className="text-cyan-400" />
                        {data?.patient?.phone}
                      </span>
                    </div>
                  </div>

                  <div className="md:w-1/2 bg-blue-950/30 p-4 rounded-lg border border-cyan-900/30 backdrop-blur-sm">
                    <span className="text-sm text-cyan-400/70 block mb-1">Address</span>
                    <p className="text-slate-300 capitalize">{data?.patient?.address}</p>
                  </div>
                </div>

                {/* Appointment Information Section 
                <div className="flex items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-indigo-400 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
                    <span className="inline-block bg-indigo-900/30 text-indigo-300 py-1 px-6 rounded-full text-lg font-medium border border-indigo-800/50 shadow-inner tracking-wider">
                      Appointment Information
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-indigo-950/30 to-indigo-900/20 p-4 rounded-lg border border-indigo-700/30 backdrop-blur-sm">
                    <span className="text-sm text-indigo-400/70 block mb-1">Date</span>
                    <p className="text-indigo-100">{format(data?.appointment_date, "MMM dd, yyyy")}</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-950/30 to-indigo-900/20 p-4 rounded-lg border border-indigo-700/30 backdrop-blur-sm">
                    <span className="text-sm text-indigo-400/70 block mb-1">Time</span>
                    <p className="text-indigo-100">{data?.time}</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-950/30 to-indigo-900/20 p-4 rounded-lg border border-indigo-700/30 backdrop-blur-sm">
                    <span className="text-sm text-indigo-400/70 block mb-1">Status</span>
                    <AppointmentStatusIndicator status={data?.status} />
                  </div>
                </div>

                {data?.note && (
                  <div className="bg-blue-950/20 p-4 rounded-lg mb-6 border-l-4 border-blue-500 backdrop-blur-sm">
                    <span className="text-sm text-blue-400/70 block mb-2">Note from Patient</span>
                    <p className="text-slate-300 italic">{data?.note}</p>
                  </div>
                )}

                {/* Physician Information Section 
                <div className="flex items-center mb-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(54,238,255,0.6)]"></div>
                    <span className="inline-block bg-emerald-900/30 text-emerald-300 py-1 px-6 rounded-full text-lg font-medium border border-emerald-800/50 shadow-inner tracking-wider">
                      Physician Information
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 items-center mb-6 bg-gradient-to-br from-emerald-950/20 to-emerald-900/10 p-4 rounded-lg border border-emerald-700/30 backdrop-blur-sm">
                  <ProfileImage
                    url={data?.doctor?.img!}
                    name={data?.doctor?.name}
                    className="size-16 !bg-emerald-600 ring-2 ring-emerald-400 ring-offset-2 ring-offset-blue-950 rounded-full overflow-hidden aspect-square shadow-[0_0_15px_rgba(54,238,255,0.4)]"
                    textClassName="text-xl font-bold"
                  />
                  <div>
                    <h2 className="text-lg uppercase font-medium text-emerald-100 tracking-wider">
                      {data?.doctor?.name}
                    </h2>
                    <p className="text-emerald-300/70 capitalize">
                      {data?.doctor?.specialization}
                    </p>
                  </div>
                </div>

                {/* Admin Actions Section 
                {((await checkRole("ADMIN")) || data?.doctor_id === userId) && (
                  <div className="mt-4">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-1 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(54,238,255,0.6)]"></div>
                        <span className="inline-block bg-purple-900/30 text-purple-300 py-1 px-6 rounded-full text-lg font-medium border border-purple-800/50 shadow-inner tracking-wider">
                          Perform Action
                        </span>
                      </div>
                    </div>
                    <AppointmentAction id={data.id} status={data?.status} />
                  </div>
                )}
              </div>
            </div>
          </>
      </DialogContent>
  </Dialog>
)
}

export default ViewAppointment
  
  
  
  */}

//OLD CODE VER 2
{/*
import { getAppointmentById } from '@/utils/services/appointment';
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { calculateAge, formatDateTime } from '@/utils';
import { ProfileImage } from './profile-image';
import { Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import AppointmentStatusIndicator from './appointment-status-indicator';
import { checkRole } from '@/utils/roles';
import { auth } from '@clerk/nextjs/server';
import { AppointmentAction } from './appointment-action';

export const ViewAppointment = async ({ id }: { id: string | undefined }) => {
    const {data} = await getAppointmentById(Number(id!));
    const {userId} = await auth()

    if(!data) return null

  return (
    <Dialog>
        <DialogTrigger asChild>
            <Button
            variant="outline"
            className="flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-xs md:text-sm transition-colors duration-200"
            >
            View
            </Button>
        </DialogTrigger>

        <DialogContent className="shad-dialog max-w-[452px] max-h-[95%] md:max-w-2xl 2xl:max-w-3xl p-0 bg-gray-900 border border-gray-800 shadow-xl"> 
            <>
              <DialogHeader className="bg-gray-950 p-6 rounded-t-lg border-b border-gray-800">
                <DialogTitle className="text-2xl font-bold text-white">Patient Appointment Information</DialogTitle>
                <DialogDescription className="text-gray-400 mt-1">
                  This appointment was scheduled on {" "}
                  {formatDateTime(data?.created_at.toString())}
                </DialogDescription>
              </DialogHeader>

              <div className="p-6">
                {data?.status === "CANCELLED" && (
                  <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg mb-6">
                    <span className="font-semibold text-red-300 block mb-1">
                      This appointment has been cancelled.
                    </span>
                    <p className="text-gray-300 text-sm">
                      <strong>Reasons:</strong> {data?.reason}
                    </p>
                  </div>
                )}

                <div className="grid gap-6">
                  {/* Personal Information Section 
                  <div className="flex items-center">
                    <span className="inline-block bg-blue-900/30 text-blue-300 py-1 px-3 rounded-full text-lg font-medium border border-blue-800">
                      Personal Information
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 mb-4">
                    <div className="flex gap-4 w-full md:w-1/2 items-center">
                    <div className="flex-shrink-0"> {/* Add this wrapper div 
                    <ProfileImage 
                      url={data?.patient?.img!}
                      name={data?.patient?.first_name + " " + data?.patient?.last_name}
                      className="size-16 bg-blue-600 ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 !rounded-full overflow-hidden aspect-square"
                      textClassName="text-xl font-bold"
                    />
                  </div>
                      
                      <div className="space-y-1"> 
                        <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wide">
                          {data?.patient?.first_name + " " + data?.patient?.last_name}
                        </h2>
                        <p className="text-gray-400 text-sm">Patient ID: {data?.patient?.id}</p>

                        <p className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} className="text-gray-500" />
                          {calculateAge(data?.patient?.date_of_birth)}
                        </p>

                        <span className="flex items-center text-gray-600 gap-2">
                          <Phone size={16} className="text-gray-500" />
                          {data?.patient?.phone}
                        </span>
                      </div>
                    </div>

                    <div className="md:w-1/2">
                      <span className="text-sm text-gray-500 block mb-1">Address</span>
                      <p className="text-gray-600 capitalize">{data?.patient?.address}</p>
                    </div>
                  </div>

                  {/* Appointment Information Section - Redesigned
                  <div className="flex items-center mb-4">
                    <span className="inline-block bg-blue-900/30 text-blue-300 py-1 px-3 rounded-full text-lg font-medium border border-blue-800">
                      Appointment Information
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-800/30 p-3 rounded-lg">
                      <span className="text-sm text-gray-400 block mb-1">Date</span>
                      <p className="text-gray-200">{format(data?.appointment_date, "MMM dd, yyyy")}</p>
                    </div>
                    <div className="bg-gray-800/30 p-3 rounded-lg">
                      <span className="text-sm text-gray-400 block mb-1">Time</span>
                      <p className="text-gray-200">{data?.time}</p>
                    </div>
                    <div className="bg-gray-800/30 p-3 rounded-lg">
                      <span className="text-sm text-gray-400 block mb-1">Status</span>
                      <AppointmentStatusIndicator status={data?.status} />
                    </div>
                  </div>

                  {data?.note && (
                    <div className="bg-gray-800/20 p-4 rounded-lg mb-6 border border-gray-700">
                      <span className="text-sm text-gray-400 block mb-2">Note from Patient</span>
                      <p className="text-gray-300">{data?.note}</p>
                    </div>
                  )}

                  {/* Physician Information Section 
                  <div className="flex items-center mb-4 mt-4">
                    <span className="inline-block bg-green-900/30 text-green-300 py-1 px-3 rounded-full text-lg font-medium border border-green-800">
                      Physician Information
                    </span>
                  </div>

                  <div className="flex gap-4 items-center mb-6"> {/* the doctors profile image has !in the colors remove that later
                    <ProfileImage
                      url={data?.doctor?.img!}
                      name={data?.doctor?.name}
                      className="size-16 !bg-emerald-600 ring-2 ring-emerald-500 ring-offset-2 ring-offset-gray-900 rounded-full overflow-hidden aspect-square"
                      textClassName="text-xl font-bold"
                    />
                    <div>
                      <h2 className="text-lg uppercase font-medium text-white">
                        {data?.doctor?.name}
                      </h2>
                      <p className="text-gray-400 capitalize">
                        {data?.doctor?.specialization}
                      </p>
                    </div>
                  </div>

                  {/* Admin Actions Section 
                  {((await checkRole("ADMIN")) || data?.doctor_id === userId) && (
                    <div className="mt-4">
                      <div className="flex items-center mb-4">
                        <span className="inline-block bg-purple-900/30 text-purple-300 py-1 px-3 rounded-full text-xs font-medium border border-purple-800">
                          Perform Action
                        </span>
                      </div>
                      <AppointmentAction id={data.id} status={data?.status} />
                    </div>
                  )}
                </div>
              </div>
            </>
        </DialogContent>
    </Dialog>
  )
}

export default ViewAppointment

*/}


























//OLD CODE
{/*

import { getAppointmentById } from '@/utils/services/appointment';
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { formatDateTime } from '@/utils';
import { ProfileImage } from './profile-image';

export const ViewAppointment = async ({ id }: { id: string | undefined }) => {
    const {data} = await getAppointmentById(Number(id!));


    if(!data) return null

  return (
    <Dialog>
        <DialogTrigger asChild>
            <Button
            variant="outline"
            className="flex items-center justify-center rounded-full bg-blue-500/10 hover:underline text-white px-1.5 py-1 text-xs md:text-sm"
            >
            View
            </Button>
        </DialogTrigger>
        <DialogContent className="shad-dialog max-w-[452px] max-h-[95%] md:max-w-2xl 2xl:max-w-3xl p-8"> {/* removed overflow-y-auto 
            <>
              <DialogHeader>
                <DialogTitle className="text-32-bold">Patient Appointment Information</DialogTitle>
                <DialogDescription className="text-16-regular">
                  This appointment was scheduled on {" "}
                  {formatDateTime(data?.created_at.toString())}
                </DialogDescription>
              </DialogHeader>

              {data?.status === "CANCELLED" && (
                <div className="bg-dark-500 p-4 mt-4 rounded-md">
                  <span className="font-semibold text-sm">
                    This appointment has been cancelled.
                  </span>
                  <p className="text-sm">
                    <strong>Reasons</strong>: {data?.reason}
                  </p>
                </div>
              )}

              <div className="grid gap-4 py-4">
              <p className="w-fit bg-blue-100 text-blue-600 py-1 rounded text-xs md:text-sm">
              Personal Information
              </p>

              <div className="flex flex-col md:flex-row gap-6 mb-16">

                <div className="flex gap-1 w-full md:w-1/2">

                <ProfileImage 
                url={data?.patient?.img!}
                name={ data?.patient?.first_name + " " + data?.patient?.last_name }
                className="size-20 bg-green-600"
                textClassName="text-2xl"

                />
                
                <div className="space-y-0.5"> 
                  <h2 className="text-lg md:text-xl font-semibold uppercase">
                    {data?.patient?.first_name + " " + data?.patient?.last_name}
                  </h2>

                </div>

                </div>

              </div>

              </div>
            </>
        </DialogContent>
        
    </Dialog>
  )
}



export default ViewAppointment */}












//OLD CODE VER 2
{/*
import { getAppointmentById } from '@/utils/services/appointment';
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { calculateAge, formatDateTime } from '@/utils';
import { ProfileImage } from './profile-image';
import { Calendar, Phone } from 'lucide-react';
import { format } from 'date-fns';
import AppointmentStatusIndicator from './appointment-status-indicator';
import { checkRole } from '@/utils/roles';
import { auth } from '@clerk/nextjs/server';
import { AppointmentAction } from './appointment-action';

export const ViewAppointment = async ({ id }: { id: string | undefined }) => {
    const {data} = await getAppointmentById(Number(id!));
    const {userId} = await auth()

    if(!data) return null

  return (
    <Dialog>
        <DialogTrigger asChild>
            <Button
            variant="outline"
            className="flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-xs md:text-sm transition-colors duration-200"
            >
            View
            </Button>
        </DialogTrigger>

        <DialogContent className="shad-dialog max-w-[452px] max-h-[95%] md:max-w-2xl 2xl:max-w-3xl p-0 bg-gray-900 border border-gray-800 shadow-xl"> 
            <>
              <DialogHeader className="bg-gray-950 p-6 rounded-t-lg border-b border-gray-800">
                <DialogTitle className="text-2xl font-bold text-white">Patient Appointment Information</DialogTitle>
                <DialogDescription className="text-gray-400 mt-1">
                  This appointment was scheduled on {" "}
                  {formatDateTime(data?.created_at.toString())}
                </DialogDescription>
              </DialogHeader>

              <div className="p-6">
                {data?.status === "CANCELLED" && (
                  <div className="bg-red-900/20 border border-red-800 p-4 rounded-lg mb-6">
                    <span className="font-semibold text-red-300 block mb-1">
                      This appointment has been cancelled.
                    </span>
                    <p className="text-gray-300 text-sm">
                      <strong>Reasons:</strong> {data?.reason}
                    </p>
                  </div>
                )}

                <div className="grid gap-6">
                  {/* Personal Information Section 
                  <div className="flex items-center">
                    <span className="inline-block bg-blue-900/30 text-blue-300 py-1 px-3 rounded-full text-lg font-medium border border-blue-800">
                      Personal Information
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 mb-4">
                    <div className="flex gap-4 w-full md:w-1/2 items-center">
                    <div className="flex-shrink-0"> {/* Add this wrapper div 
                    <ProfileImage 
                      url={data?.patient?.img!}
                      name={data?.patient?.first_name + " " + data?.patient?.last_name}
                      className="size-16 bg-blue-600 ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900 !rounded-full overflow-hidden aspect-square"
                      textClassName="text-xl font-bold"
                    />
                  </div>
                      
                      <div className="space-y-1"> 
                        <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-wide">
                          {data?.patient?.first_name + " " + data?.patient?.last_name}
                        </h2>
                        <p className="text-gray-400 text-sm">Patient ID: {data?.patient?.id}</p>

                        <p className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} className="text-gray-500" />
                          {calculateAge(data?.patient?.date_of_birth)}
                        </p>

                        <span className="flex items-center text-gray-600 gap-2">
                          <Phone size={16} className="text-gray-500" />
                          {data?.patient?.phone}
                        </span>
                      </div>
                    </div>

                    <div className="md:w-1/2">
                      <span className="text-sm text-gray-500 block mb-1">Address</span>
                      <p className="text-gray-600 capitalize">{data?.patient?.address}</p>
                    </div>
                  </div>

                  {/* Appointment Information Section - Redesigned
                  <div className="flex items-center mb-4">
                    <span className="inline-block bg-blue-900/30 text-blue-300 py-1 px-3 rounded-full text-lg font-medium border border-blue-800">
                      Appointment Information
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-800/30 p-3 rounded-lg">
                      <span className="text-sm text-gray-400 block mb-1">Date</span>
                      <p className="text-gray-200">{format(data?.appointment_date, "MMM dd, yyyy")}</p>
                    </div>
                    <div className="bg-gray-800/30 p-3 rounded-lg">
                      <span className="text-sm text-gray-400 block mb-1">Time</span>
                      <p className="text-gray-200">{data?.time}</p>
                    </div>
                    <div className="bg-gray-800/30 p-3 rounded-lg">
                      <span className="text-sm text-gray-400 block mb-1">Status</span>
                      <AppointmentStatusIndicator status={data?.status} />
                    </div>
                  </div>

                  {data?.note && (
                    <div className="bg-gray-800/20 p-4 rounded-lg mb-6 border border-gray-700">
                      <span className="text-sm text-gray-400 block mb-2">Note from Patient</span>
                      <p className="text-gray-300">{data?.note}</p>
                    </div>
                  )}

                  {/* Physician Information Section 
                  <div className="flex items-center mb-4 mt-4">
                    <span className="inline-block bg-green-900/30 text-green-300 py-1 px-3 rounded-full text-lg font-medium border border-green-800">
                      Physician Information
                    </span>
                  </div>

                  <div className="flex gap-4 items-center mb-6"> {/* the doctors profile image has !in the colors remove that later
                    <ProfileImage
                      url={data?.doctor?.img!}
                      name={data?.doctor?.name}
                      className="size-16 !bg-emerald-600 ring-2 ring-emerald-500 ring-offset-2 ring-offset-gray-900 rounded-full overflow-hidden aspect-square"
                      textClassName="text-xl font-bold"
                    />
                    <div>
                      <h2 className="text-lg uppercase font-medium text-white">
                        {data?.doctor?.name}
                      </h2>
                      <p className="text-gray-400 capitalize">
                        {data?.doctor?.specialization}
                      </p>
                    </div>
                  </div>

                  {/* Admin Actions Section 
                  {((await checkRole("ADMIN")) || data?.doctor_id === userId) && (
                    <div className="mt-4">
                      <div className="flex items-center mb-4">
                        <span className="inline-block bg-purple-900/30 text-purple-300 py-1 px-3 rounded-full text-xs font-medium border border-purple-800">
                          Perform Action
                        </span>
                      </div>
                      <AppointmentAction id={data.id} status={data?.status} />
                    </div>
                  )}
                </div>
              </div>
            </>
        </DialogContent>
    </Dialog>
  )
}

export default ViewAppointment

*/}


























//OLD CODE
{/*

import { getAppointmentById } from '@/utils/services/appointment';
import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { DialogTrigger } from '@radix-ui/react-dialog';
import { Button } from './ui/button';
import { formatDateTime } from '@/utils';
import { ProfileImage } from './profile-image';

export const ViewAppointment = async ({ id }: { id: string | undefined }) => {
    const {data} = await getAppointmentById(Number(id!));


    if(!data) return null

  return (
    <Dialog>
        <DialogTrigger asChild>
            <Button
            variant="outline"
            className="flex items-center justify-center rounded-full bg-blue-500/10 hover:underline text-white px-1.5 py-1 text-xs md:text-sm"
            >
            View
            </Button>
        </DialogTrigger>
        <DialogContent className="shad-dialog max-w-[452px] max-h-[95%] md:max-w-2xl 2xl:max-w-3xl p-8"> {/* removed overflow-y-auto 
            <>
              <DialogHeader>
                <DialogTitle className="text-32-bold">Patient Appointment Information</DialogTitle>
                <DialogDescription className="text-16-regular">
                  This appointment was scheduled on {" "}
                  {formatDateTime(data?.created_at.toString())}
                </DialogDescription>
              </DialogHeader>

              {data?.status === "CANCELLED" && (
                <div className="bg-dark-500 p-4 mt-4 rounded-md">
                  <span className="font-semibold text-sm">
                    This appointment has been cancelled.
                  </span>
                  <p className="text-sm">
                    <strong>Reasons</strong>: {data?.reason}
                  </p>
                </div>
              )}

              <div className="grid gap-4 py-4">
              <p className="w-fit bg-blue-100 text-blue-600 py-1 rounded text-xs md:text-sm">
              Personal Information
              </p>

              <div className="flex flex-col md:flex-row gap-6 mb-16">

                <div className="flex gap-1 w-full md:w-1/2">

                <ProfileImage 
                url={data?.patient?.img!}
                name={ data?.patient?.first_name + " " + data?.patient?.last_name }
                className="size-20 bg-green-600"
                textClassName="text-2xl"

                />
                
                <div className="space-y-0.5"> 
                  <h2 className="text-lg md:text-xl font-semibold uppercase">
                    {data?.patient?.first_name + " " + data?.patient?.last_name}
                  </h2>

                </div>

                </div>

              </div>

              </div>
            </>
        </DialogContent>
        
    </Dialog>
  )
}



export default ViewAppointment */}

