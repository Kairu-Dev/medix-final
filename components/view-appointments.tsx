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
                  {/* Personal Information Section */}
                  <div className="flex items-center">
                    <span className="inline-block bg-blue-900/30 text-blue-300 py-1 px-3 rounded-full text-lg font-medium border border-blue-800">
                      Personal Information
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 mb-4">
                    <div className="flex gap-4 w-full md:w-1/2 items-center">
                    <div className="flex-shrink-0"> {/* Add this wrapper div */}
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

                  {/* Appointment Information Section - Redesigned */}
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

                  {/* Physician Information Section */}
                  <div className="flex items-center mb-4 mt-4">
                    <span className="inline-block bg-green-900/30 text-green-300 py-1 px-3 rounded-full text-lg font-medium border border-green-800">
                      Physician Information
                    </span>
                  </div>

                  <div className="flex gap-4 items-center mb-6"> {/* the doctors profile image has !in the colors remove that later */}
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

                  {/* Admin Actions Section */}
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

