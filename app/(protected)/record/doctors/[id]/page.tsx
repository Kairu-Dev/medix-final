import { availableDays } from '@/components/available-doctor';
import RatingContainer from '@/components/doc-rating-container';
import { ProfileImage } from '@/components/profile-image';
import RecentAppointments from '@/components/tables/recent-appointments';
import { getDoctorById } from '@/utils/services/doctor'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react'

import { BsCalendarDateFill, BsPersonWorkspace } from "react-icons/bs";
import { FaBriefcaseMedical, FaCalendarDays } from "react-icons/fa6";
import { IoTimeSharp } from "react-icons/io5";
import { MdEmail, MdOutlineLocalPhone } from "react-icons/md";


const DoctorProfile = async(props: {params: Promise <{id: string}>}) => {
    const params = await props.params;
    const {data, totalAppointment } = await getDoctorById(params?.id);
    /* eslint-disable */

    if (!data) return null;

  return (
    <div className="overflow-hidden md:overflow-auto remove-scrollbar bg-black-800/60 h-full rounded-xl py-6 px-3 2xl:px-5 flex flex-col lg:flex-row gap-6 border border-amber-200/30 shadow-lg relative backdrop-blur-sm">
        {/* Genshin-style ornamental corner decorations */}
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-400/60 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-400/60 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl"></div>
        
        {/* Light glow effects */}
        <div className="absolute -top-10 right-20 w-40 h-40 bg-amber-300/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 left-40 w-40 h-40 bg-amber-200/10 rounded-full blur-3xl"></div>
        
        <div className="w-full lg:w-[70%] relative z-10">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-6 px-4 rounded-xl flex-1 flex gap-4 border border-amber-200/40 shadow-md backdrop-blur-sm">
                    <ProfileImage 
                    url={data?.img!}
                    name={data?.name}
                    className="size-20 ring-2 ring-amber-400 ring-offset-2 ring-offset-amber-50/20 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                    bgColor={data?.colorCode!}
                    textClassName="text-4xl text-black"
                    />

                    <div className="w-2/3 flex flex-col justify-between gap-x-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl md:text-2xl font-bold uppercase text-white tracking-wider">
                                {data?.name}
                            </h1>
                        </div>

                        <p className="text-sm font-medium text-amber-200">{data?.address || "No Address Information Found"}</p>

                        <div className="mt-4 flex items-center justify-between gap-2 flex-wrap text-sm font-medium">
                            <div className="w-full flex text-base">
                                <span className="text-amber-200 shrink-0">License #:</span>
                                <p className="font-semibold text-white ml-1"> {data?.license_number}</p>
                            </div>

                            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                <FaBriefcaseMedical className="text-lg text-amber-400" />
                                <span className="capitalize text-white">{data?.specialization}</span>
                            </div>

                            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                <BsPersonWorkspace className="text-lg text-amber-400" />
                                <span className="capitalize text-white">{data?.type}</span>
                            </div>

                            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                <MdEmail className="text-lg text-amber-400 shrink-0" />
                                <span className="capitalize text-white">{data?.email}</span>
                                
                            </div>

                            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                <MdOutlineLocalPhone className="text-lg text-amber-400 shrink-0" />
                                <span className="capitalize text-white">{data?.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 flex gap-4 justify-between flex-wrap">
                    <div className="bg-gradient-to-br from-amber-50/20 to-amber-100/10 p-4 rounded-xl border border-amber-200/40 shadow-md flex flex-col items-center gap-2 w-[calc(50%-0.5rem)] backdrop-blur-sm relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-amber-400/40 rounded-tl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-amber-400/40 rounded-br-lg"></div>
                        
                        <FaBriefcaseMedical className="size-5 text-amber-400" />
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-white">{totalAppointment}</h1>
                            <span className="text-base text-amber-200 font-medium">Appointments</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50/20 to-amber-100/10 p-4 rounded-xl border border-amber-200/40 shadow-md flex flex-col items-center gap-2 w-[calc(50%-0.5rem)] backdrop-blur-sm relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-amber-400/40 rounded-tl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-amber-400/40 rounded-br-lg"></div>
                        
                        <FaCalendarDays className="size-5 text-amber-400" />
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-white">{data?.working_days?.length}</h1>
                            <span className="text-base text-amber-200 font-medium">Working Days</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50/20 to-amber-100/10 p-4 rounded-xl border border-amber-200/40 shadow-md flex flex-col items-center gap-2 w-[calc(50%-0.5rem)] backdrop-blur-sm relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-amber-400/40 rounded-tl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-amber-400/40 rounded-br-lg"></div>
                        
                        <IoTimeSharp className="size-5 text-amber-400" />
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-white">{availableDays({data: data.working_days})}</h1>
                            <span className="text-base text-amber-200 font-medium">Working Hours</span>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50/20 to-amber-100/10 p-4 rounded-xl border border-amber-200/40 shadow-md flex flex-col items-center gap-2 w-[calc(50%-0.5rem)] backdrop-blur-sm relative overflow-hidden">
                        {/* Decorative elements */}
                        <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-amber-400/40 rounded-tl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-amber-400/40 rounded-br-lg"></div>
                        
                        <BsCalendarDateFill className="size-5 text-amber-400" />
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-white">{format(data?.created_at, "yyyy-MM-dd")}</h1>
                            <span className="text-base text-amber-200 font-medium">Join Date</span>
                        </div>
                    </div>
                </div>
            </div>

            {/*Recent Appointment */}
            <div className="bg-gradient-to-b from-amber-50/20 to-amber-100/10 rounded-xl p-4 mt-6 gap-5 border border-amber-200/40 shadow-md backdrop-blur-sm relative">
                {/* Decorative line */}
                <div className="absolute -left-1 top-6 h-16 w-1 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]"></div>
                <RecentAppointments data={data?.appointments} />
            </div>  
        </div>

        {/*Right */}
        <div className="w-full lg:w-[30%] flex flex-col gap-4 relative z-10">
            <div className="bg-gradient-to-b from-amber-50/20 to-amber-100/10 p-4 rounded-xl border border-amber-200/40 shadow-md backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                    <h1 className="text-xl font-bold text-white tracking-wider">Quick Links</h1>
                </div>
                <div className="mt-4 flex gap-4 flex-wrap text-xs">
                    <Link href={`/record/appointments?id=${data?.id}`}
                    className="p-3 rounded-md bg-amber-600/70 hover:bg-amber-600/90 text-white font-medium border border-amber-300/50 transition-colors duration-200 shadow-md hover:shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    >
                    Doctor Appointments
                    </Link>

                    <VisuallyHidden>

                    <Link href="#"
                    className="p-3 rounded-md bg-amber-600/70 hover:bg-amber-600/90 text-white font-medium border border-amber-300/50 transition-colors duration-200 shadow-md hover:shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    >
                    Apply for Leave
                    </Link>
                    </VisuallyHidden>
                </div>
            </div>

            {/* Ratings Container - Now separated */}
            <div className="bg-gradient-to-b from-amber-50/20 to-amber-100/10 p-4 rounded-xl border border-amber-200/40 shadow-md backdrop-blur-sm relative">
                {/* Ornamental corners */}
                
                <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-amber-400/40 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-amber-400/40 rounded-bl-lg"></div>
                
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-6 w-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                    <h1 className="text-xl font-bold text-white tracking-wider">Patient Reviews & Ratings</h1>
                </div>
                
                {/* Rating Container with fantasy styling */}
                
                <RatingContainer id={params?.id}/>
            </div>
            
  
        </div>
    </div>
  )
}

export default DoctorProfile

{/*

import { availableDays } from '@/components/available-doctors';
import RatingContainer from '@/components/doc-rating-container';
import PatientRatingContainer from '@/components/patient-rating-container';
import { ProfileImage } from '@/components/profile-image';
import RecentAppointments from '@/components/tables/recent-appointments';
import { getDoctorById } from '@/utils/services/doctor'
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react'

import { BsCalendarDateFill, BsPersonWorkspace } from "react-icons/bs";
import { FaBriefcaseMedical, FaCalendarDays } from "react-icons/fa6";
import { IoTimeSharp } from "react-icons/io5";
import { MdEmail, MdLocalPhone, MdOutlineLocalPhone } from "react-icons/md";


const DoctorProfile = async(props: {params: Promise <{id: string}>}) => {
    const params = await props.params;
    const {data, totalAppointment } = await getDoctorById(params?.id);

    if (!data) return null;

  return (
    <div className="bg-black-800/60 h-full rounded-xl py-6 px-3 2xl:px-5 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-[70%]">
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="bg-green-600 py-6 px-4 rounded-md flex-1 flex gap-4">
                    <ProfileImage 
                    url={data?.img!}
                    name={data?.name}
                    className="size-20"
                    bgColor={data?.colorCode!}
                    textClassName="text-4xl text-black"
                    
                    />

                    <div className="w-2/3 flex flex-col justify-between gap-x-4">
                        <div className="flex items-center gap-4">
                            <h1 className="sub-header uppercase">
                                {data?.name}
                            </h1>
                        </div>

                        <p className="text-sm text-gray-500">{data?.address || "No Address Information Found"}</p>

                        <div className="mt-4 flex items-center justify-between gap-2 flex-wrap text-sm font-medium">
                            <div className="w-full flex text-base">
                                <span>License #:  </span>
                                <p className="font-semibold"> {data?.license_number}</p>
                            </div>

                            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                <FaBriefcaseMedical className="text-lg" />
                                <span className="capitalize">{data?.specialization}</span>
                            </div>

                            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                <BsPersonWorkspace className="text-lg" />
                                <span className="capitalize">{data?.type}</span>
                            </div>

                            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                <MdEmail className="text-lg" />
                                <span className="capitalize">{data?.email}</span>
                            </div>

                            <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                                <MdOutlineLocalPhone className="text-lg" />
                                <span className="capitalize">{data?.phone}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats *
                <div className="flex-1 flex gap-4 justify-between flex-wrap">
                    <div className="doctorCard">

                        <FaBriefcaseMedical className="size-5" />
                        <div>
                            <h1 className="text-xl font-semibold">{totalAppointment}</h1>
                            <span className="text-lg text-amber-500">Appointments</span>
                        </div>
                    </div>

                    <div className="doctorCard">

                    <FaCalendarDays className="size-5" />
                    <div>
                        <h1 className="text-xl font-semibold">{data?.working_days?.length}</h1>
                        <span className="text-lg text-amber-500">Working Days</span>
                    </div>

                    </div>

                    <div className="doctorCard">

                    <IoTimeSharp className="size-5" />
                    <div>
                        <h1 className="text-xl font-semibold">{availableDays({data: data.working_days})}</h1>
                        <span className="text-lg text-amber-500">Working Hours</span>
                    </div>

                    </div>

                    <div className="doctorCard">

                    <BsCalendarDateFill className="size-5" />
                    <div>
                        <h1 className="text-xl font-semibold">{format(data?.created_at, "yyyy-MM-dd")}</h1>
                        <span className="text-lg text-amber-500">Join Date</span>
                    </div>

                    </div> 

                </div>
            </div>

          

            <div className="bg-black-800 rounded-e-xl p-4 mt-6 gap-5">
                <RecentAppointments data={data?.appointments} />
            </div>  
        </div>

     

        <div className="w-full lg:w-[30%] flex flex-col gap-4">
            <div className="bg-black-800 p-4 rounded-md">
                <h1 className="text-xl font-semibold">Quick Links</h1>
                <div className="mt-8 flex gap-4 flex-wrap text-sm text-gray-500">
                   <Link href={`/record/appointments?id=${data?.id}`}
                   className="p-3 rounded-md bg-yellow-100 hover:underline"
                   
                   >
                   Doctor Appointments
                   </Link>

                   <Link href="#"
                   className="p-3 rounded-md bg-red-100 hover:underline"
                   
                   >
                   Apply for Leave
                   </Link>
                </div>
            </div>

            <RatingContainer  id={params?.id}/>

        </div>
    </div>
    
  )
}

export default DoctorProfile


*/}


