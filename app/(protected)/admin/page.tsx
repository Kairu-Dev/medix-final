
import AvailableDoctors from '@/components/available-doctor';
import { AppointmentChart } from '@/components/charts/appointment-chart';
import { StatSummary } from '@/components/charts/stat-summary';
import StatCard from '@/components/stat-card';
import RecentAppointments from '@/components/tables/recent-appointments';
import { Button } from '@/components/ui/button';
import { getAdminDashboardStatistics } from '@/utils/services/admin'
import { BriefcaseBusiness, BriefcaseMedical, User, Users } from 'lucide-react';
import React from 'react'

const AdminDashboard = async() => {
  const {
    availableDoctors, 
    last5Records, 
    appointmentCounts, 
    monthlyData, 
    totalPatient, 
    totalDoctors,
    totalAppointments,
  } = await getAdminDashboardStatistics();

  const cardData = [
    {
      title: "Patients",
      value: totalPatient,
      icon: Users,
      className: "bg-gradient-to-br from-teal-900/80 to-teal-950/90",
      iconClassName: "bg-teal-700 text-teal-100 shadow-[0_0_12px_rgba(20,184,166,0.6)]",
      textColor: "text-teal-200",
      valueColor: "text-teal-100",
      note: "Total patients",
      link: "/manage-patients",
    },
    {
      title: "Doctors",
      value: totalDoctors,
      icon: User,
      className: "bg-gradient-to-br from-emerald-900/80 to-emerald-950/90",
      iconClassName: "bg-emerald-700 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.6)]",
      textColor: "text-emerald-200",
      valueColor: "text-emerald-100",
      note: "Total doctors",
      link: "/manage-doctors",
    },
    {
      title: "Appointments",
      value: totalAppointments,
      icon: BriefcaseBusiness,
      className: "bg-gradient-to-br from-green-900/80 to-green-950/90",
      iconClassName: "bg-green-700 text-green-100 shadow-[0_0_12px_rgba(34,197,94,0.6)]",
      textColor: "text-green-200",
      valueColor: "text-green-100",
      note: "Total appointments",
      link: "/manage-appointments",
    },
    {
      title: "Consultation",
      value: appointmentCounts?.COMPLETED,
      icon: BriefcaseMedical,
      className: "bg-gradient-to-br from-cyan-900/80 to-cyan-950/90",
      iconClassName: "bg-cyan-700 text-cyan-100 shadow-[0_0_12px_rgba(8,145,178,0.6)]",
      textColor: "text-cyan-200",
      valueColor: "text-cyan-100",
      note: "Total consultation",
      link: "/manage-appointments",
    },
  ];

  return (
    <div className="py-6 px-3 flex flex-col xl:flex-row rounded-xl gap-6 bg-gray-900/60 border border-emerald-500/40 shadow-lg relative backdrop-blur-sm">
      {/* Minecraft-style decorative elements */}
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
      <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
      
      {/* Enhanced emerald glow effects */}
      <div className="absolute -top-10 right-20 w-40 h-40 bg-emerald-300/30 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 left-40 w-40 h-40 bg-emerald-200/20 rounded-full blur-3xl"></div>
      <div className="absolute top-1/4 left-1/3 w-24 h-24 bg-emerald-400/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-emerald-500/15 rounded-full blur-3xl"></div>
      
      {/* LEFT*/ }
      <div className="w-full xl:w-[69%] relative z-10">

        <div className="bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 mb-8 border border-emerald-500/40 shadow-md backdrop-blur-sm">
          <div className="flex items-center justify-between relative">
            {/* Decorative pixel-style accent line */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
            
            <h1 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase">Statistics</h1>
            <Button size="sm" variant={"outline"} className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-950/50 hover:text-emerald-200">
              {new Date().getFullYear()}
            </Button>
          </div>

          <div className="w-full flex flex-wrap gap-5 mt-4">
            {
              cardData?.map((el,index)=> (
                <StatCard 
                key={index}
                title={el.title}
                value={el.value!}
                icon={el.icon}
                className={el.className}
                iconClassName={el.iconClassName}
                note={el.note}
                link={el.link}
                />
              ))
            }
          </div>
        </div>

        <div className="h-[500px] bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm">
          <div className="flex items-center relative">
            <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
            
          </div>
          <AppointmentChart data={monthlyData!}/>
        </div>

        <div className="bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 mt-8 border border-emerald-500/40 shadow-md backdrop-blur-sm">
          <div className="flex items-center relative">
            <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
         
          </div>
          <RecentAppointments data={last5Records!} />
        </div>

      </div>


      {/*RIGHT */}
      <div className="w-full xl:w-[30%] relative z-10">

        <div className="w-full h-[450px] bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm">
          <div className="flex items-center relative">
            <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
           
          </div>
          <StatSummary data={appointmentCounts} total={totalAppointments!} />
        </div>

        <div className="mt-5 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm">
          <div className="flex items-center relative">
            <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
       
          </div>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <AvailableDoctors data={availableDoctors as any} />
        </div>

      </div>
    </div>
  )
}

export default AdminDashboard




{/*


import AvailableDoctors from '@/components/available-doctors';
import { AppointmentChart } from '@/components/charts/appointment-chart';
import { StatSummary } from '@/components/charts/stat-summary';
import StatCard from '@/components/stat-card';
import RecentAppointments from '@/components/tables/recent-appointments';
import { Button } from '@/components/ui/button';
import { getAdminDashboardStatistics } from '@/utils/services/admin'
import { BriefcaseBusiness, BriefcaseMedical, User, Users } from 'lucide-react';
import React from 'react'

const AdminDashboard = async() => {
  const {
    availableDoctors, 
    last5Records, 
    appointmentCounts, 
    monthlyData, 
    totalPatient, 
    totalDoctors,
    totalAppointments,
  } = await getAdminDashboardStatistics();

  const cardData = [
    {
      title: "Patients",
      value: totalPatient,
      icon: Users,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Total patients",
      link: "/manage-patients",
    },
    {
      title: "Doctors",
      value: totalDoctors,
      icon: User,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Total doctors",
      link: "/manage-doctors",
    },
    {
      title: "Appointments",
      value: totalAppointments,
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Total appointments",
      link: "/manage-appointments",
    },
    {
      title: "Consultation",
      value: appointmentCounts?.COMPLETED,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Total consultation",
      link: "/manage-appointments",
    },
  ];

  return (
    <div className="py-6 px-3 flex flex-col xl:flex-row rounded-xl gap-6">
      {/* LEFT
      <div className="w-full xl:w-[69%]">

        <div className="bg-black-800 rounded-xl p-4 mb-8">
          
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold">Statistics</h1>
            <Button size="sm" variant={"outline"}>
              {new Date().getFullYear()}
            </Button>
          </div>

          <div className="w-full flex flex-wrap gap-5">
            {
              cardData?.map((el,index)=> (
                <StatCard 

                key={index}
                title={el.title}
                value={el.value!}
                icon={el.icon}
                className={el.className}
                iconClassName={el.iconClassName}
                note={el.note}
                link={el.link}
                />
              ))
            }
          </div>
        </div>

        <div className="h-[500px]">
          <AppointmentChart data={monthlyData!}/>
        </div>

        <div className="bg-black-800 rounded-xl p-4 mt-8">
          <RecentAppointments data={last5Records!} />
        </div>

      </div>


      {/*RIGHT 
      <div className="w-full xl:w-[30%]">

        <div className="w-full h-[450px]">

          <StatSummary data={appointmentCounts} total={totalAppointments!} />
        </div>

        <div className="mt-5">

          <AvailableDoctors data={availableDoctors as any} />

        </div>

      </div>
    </div>
  )
}

export default AdminDashboard


*/}