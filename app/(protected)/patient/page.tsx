
import AvailableDoctors from '@/components/available-doctor'
import { AppointmentChart } from '@/components/charts/appointment-chart'
import { StatSummary } from '@/components/charts/stat-summary'
import PatientRatingContainer from '@/components/patient-rating-container'
import StatCard from '@/components/stat-card'
import RecentAppointments from '@/components/tables/recent-appointments'
import { Button } from '@/components/ui/button'
import { AvailableDoctorProps } from '@/types/data-types'
import { getPatientDashboardStatistics } from '@/utils/services/patientFetchInfo'
import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { Briefcase, BriefcaseBusiness, BriefcaseMedical } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

const PatientDashBoard = async() => {
  
  const user = await currentUser()

  const { data, appointmentCounts, last5Records, totalAppointments, availableDoctor, monthlyData } = await getPatientDashboardStatistics(user?.id!);

  if(user && !data) {
    redirect("/patient/registration/");
  }

  if (!data) return null;

  

  

  


  const cardData = [
    {
      title: "appointments",
      value: totalAppointments,
      icon: Briefcase,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600 text-blue-400",
      note: "Total appointments",
    },
    {
      title: "cancelled",
      value: appointmentCounts?.CANCELLED,
      icon: Briefcase,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Cancelled Appointments",
    },
    {
      title: "pending",
      value: appointmentCounts?.PENDING! + appointmentCounts?.SCHEDULED!,
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Pending Appointments",
    },
    {
      title: "completed",
      value: appointmentCounts?.COMPLETED,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Successfully appointments",
    },
  ];

  //console.log(monthlyData);

   
  return (
    <div className="py-2 px-2 flex flex-col rounded-xl xl:flex-row gap-6">
      {/*Left Section*/}

      <div className="w-full xl:w-[69%]"> {/* Originally w-full check global.css*/}

        <div className="bg-black-800 p-4 rounded-xl mb-8">

          <div className="flex items-center justify-between mb-4">

            <h1 
            className=" font-bold text-lg xl:text-2xl text-green-500">

              Welcome { data?.first_name || user?.firstName }

            </h1>

            <div className="space-x-2">
              <Button className="shad-primary-btn"size={"sm"}>
                {new Date().getFullYear()}
              </Button>

              <Button variant="outline" className="hover:underline" size="sm">
                <Link href="/patient/self">View Profile</Link>
              </Button>
            </div>

          </div>


          <div className="w-full flex flex-wrap gap-5">
                { cardData?.map((el, id) => (
                  <StatCard key={id} {...el} link="#" />
                ))}
          </div>

        </div>

        <div className="h-[500px]">
                <AppointmentChart data={monthlyData} />
        </div>

        <div className="bg-black-800 rounded-xl p-4 mt-8">
           <RecentAppointments data={last5Records} />
        </div>

      </div>

      {/*Right Section*/}

      <div className="w-full xl:w-[30%]"> 

            <div className="w-full h-[450px] mb-8">

             <StatSummary data={appointmentCounts} total={totalAppointments} /> 

            </div>

             <AvailableDoctors data={availableDoctor as AvailableDoctorProps} /> 

             <PatientRatingContainer />
      </div>
      
    </div>

  )
}

export default PatientDashBoard