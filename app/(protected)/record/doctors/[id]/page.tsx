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
    <div className="min-h-screen bg-black-800/60 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="overflow-hidden bg-gradient-to-br from-black-800/60 to-black-900/60 rounded-xl border border-amber-200/30 shadow-2xl relative backdrop-blur-sm">
          {/* Main ornamental corners - only on the outer container */}
          <div className="absolute top-0 left-0 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl transition-all duration-300"></div>
          <div className="absolute top-0 right-0 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 border-t-2 border-r-2 border-amber-400/60 rounded-tr-xl transition-all duration-300"></div>
          <div className="absolute bottom-0 left-0 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 border-b-2 border-l-2 border-amber-400/60 rounded-bl-xl transition-all duration-300"></div>
          <div className="absolute bottom-0 right-0 w-8 sm:w-12 md:w-16 h-8 sm:h-12 md:h-16 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl transition-all duration-300"></div>
          
          {/* Light glow effects */}
          <div className="absolute -top-10 right-20 w-20 sm:w-32 md:w-40 h-20 sm:h-32 md:h-40 bg-amber-300/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 left-40 w-20 sm:w-32 md:w-40 h-20 sm:h-32 md:h-40 bg-amber-200/10 rounded-full blur-3xl"></div>
          
          <div className="p-4 sm:p-6 flex flex-col xl:flex-row gap-6 relative z-10">
            {/* Left Section */}
            <div className="w-full xl:w-[70%]">
              {/* Doctor Info Section */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Main Info Card */}
                <div className="bg-gradient-to-b from-amber-50/20 to-amber-100/10 py-4 sm:py-6 px-3 sm:px-4 rounded-xl flex-1 border border-amber-200/40 shadow-md backdrop-blur-sm relative">
                  {/* Small decorative corners for inner cards */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-amber-400/40 rounded-tl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-amber-400/40 rounded-br-lg"></div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex justify-center sm:justify-start">
                      <ProfileImage 
                        url={data?.img!}
                        name={data?.name}
                        className="size-16 sm:size-20 ring-2 ring-amber-400 ring-offset-2 ring-offset-amber-50/20 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                        bgColor={data?.colorCode!}
                        textClassName="text-2xl sm:text-4xl text-black"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between gap-2 text-center sm:text-left">
                      <div>
                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold uppercase text-white tracking-wider">
                          {data?.name}
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-amber-200 mt-1">
                          {data?.address || "No Address Information Found"}
                        </p>
                      </div>

                      <div className="mt-2 sm:mt-4 space-y-2 text-xs sm:text-sm font-medium">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                          <span className="text-amber-200 shrink-0">License #:</span>
                          <p className="font-semibold text-white">{data?.license_number}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <FaBriefcaseMedical className="text-base sm:text-lg text-amber-400 shrink-0" />
                            <span className="capitalize text-white text-xs sm:text-sm">{data?.specialization}</span>
                          </div>

                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <BsPersonWorkspace className="text-base sm:text-lg text-amber-400 shrink-0" />
                            <span className="capitalize text-white text-xs sm:text-sm">{data?.type}</span>
                          </div>

                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <MdEmail className="text-base sm:text-lg text-amber-400 shrink-0" />
                            <span className="text-white text-xs sm:text-sm break-all">{data?.email}</span>
                          </div>

                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <MdOutlineLocalPhone className="text-base sm:text-lg text-amber-400 shrink-0" />
                            <span className="text-white text-xs sm:text-sm">{data?.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 lg:w-64 xl:w-auto">
                  <div className="bg-gradient-to-br from-amber-50/20 to-amber-100/10 p-3 sm:p-4 rounded-xl border border-amber-200/40 shadow-md flex flex-col items-center gap-2 backdrop-blur-sm relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-amber-400/40 rounded-tl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-400/40 rounded-br-lg"></div>
                    
                    <FaBriefcaseMedical className="size-4 sm:size-5 text-amber-400" />
                    <div className="text-center">
                      <h1 className="text-lg sm:text-xl font-bold text-white">{totalAppointment}</h1>
                      <span className="text-xs sm:text-sm text-amber-200 font-medium">Appointments</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50/20 to-amber-100/10 p-3 sm:p-4 rounded-xl border border-amber-200/40 shadow-md flex flex-col items-center gap-2 backdrop-blur-sm relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-amber-400/40 rounded-tl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-400/40 rounded-br-lg"></div>
                    
                    <FaCalendarDays className="size-4 sm:size-5 text-amber-400" />
                    <div className="text-center">
                      <h1 className="text-lg sm:text-xl font-bold text-white">{data?.working_days?.length}</h1>
                      <span className="text-xs sm:text-sm text-amber-200 font-medium">Working Days</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50/20 to-amber-100/10 p-3 sm:p-4 rounded-xl border border-amber-200/40 shadow-md flex flex-col items-center gap-2 backdrop-blur-sm relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-amber-400/40 rounded-tl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-400/40 rounded-br-lg"></div>
                    
                    <IoTimeSharp className="size-4 sm:size-5 text-amber-400" />
                    <div className="text-center">
                      <h1 className="text-lg sm:text-xl font-bold text-white">{availableDays({data: data.working_days})}</h1>
                      <span className="text-xs sm:text-sm text-amber-200 font-medium">Working Hours</span>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50/20 to-amber-100/10 p-3 sm:p-4 rounded-xl border border-amber-200/40 shadow-md flex flex-col items-center gap-2 backdrop-blur-sm relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-amber-400/40 rounded-tl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-400/40 rounded-br-lg"></div>
                    
                    <BsCalendarDateFill className="size-4 sm:size-5 text-amber-400" />
                    <div className="text-center">
                      <h1 className="text-lg sm:text-xl font-bold text-white">{format(data?.created_at, "yyyy-MM-dd")}</h1>
                      <span className="text-xs sm:text-sm text-amber-200 font-medium">Join Date</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Appointments */}
              <div className="bg-gradient-to-b from-amber-50/20 to-amber-100/10 rounded-xl p-3 sm:p-4 border border-amber-200/40 shadow-md backdrop-blur-sm relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-amber-400/40 rounded-tl-lg"></div>
                <div className="absolute -left-1 top-4 sm:top-6 h-12 sm:h-16 w-1 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]"></div>
                <RecentAppointments data={data?.appointments} />
              </div>  
            </div>

            {/* Right Sidebar */}
            <div className="w-full xl:w-[30%] flex flex-col gap-4">
              {/* Quick Links */}
              <div className="bg-gradient-to-b from-amber-50/20 to-amber-100/10 p-3 sm:p-4 rounded-xl border border-amber-200/40 shadow-md backdrop-blur-sm relative">
                <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-amber-400/40 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-amber-400/40 rounded-bl-lg"></div>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-wider">Quick Links</h1>
                </div>
                <div className="flex gap-2 sm:gap-4 flex-wrap">
                  <Link 
                    href={`/record/appointments?id=${data?.id}`}
                    className="flex-1 min-w-0 p-2 sm:p-3 text-center rounded-md bg-amber-600/70 hover:bg-amber-600/90 text-white font-medium border border-amber-300/50 transition-all duration-200 shadow-md hover:shadow-[0_0_8px_rgba(251,191,36,0.5)] text-xs sm:text-sm"
                  >
                    Doctor Appointments
                  </Link>

                  <VisuallyHidden>
                    <Link 
                      href="#"
                      className="flex-1 min-w-0 p-2 sm:p-3 text-center rounded-md bg-amber-600/70 hover:bg-amber-600/90 text-white font-medium border border-amber-300/50 transition-colors duration-200 shadow-md hover:shadow-[0_0_8px_rgba(251,191,36,0.5)] text-xs sm:text-sm"
                    >
                      Apply for Leave
                    </Link>
                  </VisuallyHidden>
                </div>
              </div>

              {/* Ratings Container */}
              <div className="bg-gradient-to-b from-amber-50/20 to-amber-100/10 p-3 sm:p-4 rounded-xl border border-amber-200/40 shadow-md backdrop-blur-sm relative flex-1">
                <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-amber-400/40 rounded-tl-lg"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-amber-400/40 rounded-br-lg"></div>
                
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                  <h1 className="text-lg sm:text-xl font-bold text-white tracking-wider">Patient Reviews & Ratings</h1>
                </div>
                
                <RatingContainer id={params?.id}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile