
import AvailableNurses from '@/components/available-nurses';
import { AppointmentChart } from '@/components/charts/appointment-chart';
import { StatSummary } from '@/components/charts/stat-summary';
import StatCard from '@/components/stat-card';
import RecentAppointments from '@/components/tables/recent-appointments';
import { Button } from '@/components/ui/button';
import { getStaffDashboardStatistics } from '@/utils/services/staff';
import { currentUser } from '@clerk/nextjs/server';
import { BriefcaseBusiness, BriefcaseMedical, User, Users } from 'lucide-react';
import React from 'react'

const StaffDashboard = async() => {
  const user = await currentUser();

  const {
    totalPatient,
    totalNurses, 
    appointmentCounts, 
    totalAppointments,
    monthlyData,
    last5Records,
    availableNurses,
  } = await getStaffDashboardStatistics ();

  const cardData = [
    {
      title: "Patients",
      value: totalPatient,
      icon: Users,
      className: "bg-gradient-to-br from-blue-400/20 to-blue-600/10",
      iconClassName: "bg-blue-400/25 text-blue-100",
      note: "Total patients",
      link: "/record/patients",
    },
    {
      title: "Nurses",
      value: totalNurses,
      icon: User,
      className: "bg-gradient-to-br from-rose-400/20 to-rose-600/10",
      iconClassName: "bg-rose-400/25 text-rose-100",
      note: "Total nurses",
      link: "",
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
  
  return <div className="rounded-xl py-6 px-3 flex flex-col xl:flex-row gap-6 relative">
    {/* Background effects */}
    <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-300/5 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-amber-200/5 rounded-full blur-3xl"></div>

    {/* LEFT SIDE */}
    <div className="w-full xl:w-[69%] relative z-10">

      <div className="bg-black-800 rounded-xl p-4 mb-8 border border-amber-200/30 backdrop-blur-sm shadow-lg relative overflow-hidden">
        {/* Ornamental corners */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-400/60 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-400/60 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl"></div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-1 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
            <h1 className="text-white text-xl xl:text-2xl font-extrabold tracking-wide leading-tight"> Welcome, <span className="text-amber-100">Nurse {user?.firstName}</span></h1>
          </div>

          <Button 
            size="sm" 
            variant="outline" 
            className="border-amber-400/60 text-amber-200 hover:text-amber-100 hover:bg-amber-500/20 hover:shadow-[0_0_8px_rgba(251,191,36,0.3)]"
            asChild
          >
             {new Date().getFullYear()}
          </Button>
        </div>

        <div className="w-full flex flex-wrap gap-5">
          {cardData?.map((el, index) => (
            <StatCard 
              key={index}
              title={el?.title}
              value={el?.value ?? 0}
              icon={el?.icon} 
              iconClassName={el?.iconClassName}
              note={el?.note}
              link={el?.link}
              className={`${el?.className} border border-amber-200/30 shadow-md relative`}
            />   
          ))}
        </div>
      </div>

      <div className="h-[500px] bg-black-800 rounded-xl border border-amber-200/30 backdrop-blur-sm shadow-lg p-4 relative overflow-hidden">
        {/* Ornamental corners */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl"></div>
        

        
         <AppointmentChart data={monthlyData!} />
      </div>

      <div className="bg-black-800 rounded-xl p-4 mt-8 border border-amber-200/30 backdrop-blur-sm shadow-lg relative overflow-hidden">
        {/* Ornamental corners */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl"></div>
        


        <RecentAppointments data={last5Records!} /> 
      </div>
    </div>

    {/* Right SIDE */}
    <div className="w-full xl:w-[30%] relative z-10">
      <div className="w-full h-[450px] mb-8 bg-black-800 rounded-xl p-4 border border-amber-200/30 backdrop-blur-sm shadow-lg relative overflow-hidden">
        {/* Ornamental corners */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl"></div>
        


        <StatSummary data={appointmentCounts} total={totalAppointments!} /> 
      </div>

            <div className="bg-black-800 rounded-xl p-4 border border-amber-200/30 backdrop-blur-sm shadow-lg relative overflow-hidden">
              {/* Ornamental corners */}
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl"></div>
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl"></div>
              
      
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <AvailableNurses data={availableNurses as any} />
      </div>

      
    </div>  
  </div>;
};


export default StaffDashboard