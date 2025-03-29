//Genshin GG Design 

import React from 'react'
import { Button } from '../ui/button';
import Link from 'next/link';
import { Table } from './table';
import { Appointment } from '@/types/data-types';
import { ProfileImage } from '../profile-image';
import { format } from 'date-fns';
import AppointmentStatusIndicator from '../appointment-status-indicator';
import ViewAppointment from '../view-appointments';
 /* eslint-disable */


interface DataProps {
    data: any[];
}

const columns = [
    { header: "Info", key: "name" },
    {
      header: "Date",
      key: "appointment_date",
      className: "hidden md:table-cell",
    },
    {
      header: "Time",
      key: "time",
      className: "hidden md:table-cell",
    },
    {
      header: "Doctor",
      key: "doctor",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      key: "status",
      className: "hidden xl:table-cell",
    },
    {
      header: "Actions",
      key: "action",
    },
  ];

export const RecentAppointments = ({ data }: DataProps) => {

    //console.log(data);

    const renderRow = (item: Appointment) => { 

      const name = item?.patient?.first_name + " " + item?.patient?.last_name

      return (
    
    <tr
    key={item?.id}
    className="border-b border-gray-700/30 even:bg-dark-300 text-sm hover:bg-teal-950/40 transition-colors duration-200"
    >

        <td className="flex items-center gap-2 2xl:gap-4 py-2 xl:py-4">
        <ProfileImage
            url={item?.patient?.img!}
            name={name}
            className="bg-green-900 ring-1 ring-teal-500/30"
            bgColor={item?.patient?.colorCode!}
          />  
        
            <div>
                <h3 className="text-sm md:text-base md:font-medium uppercase text-white">
                  {name}
                  </h3>
                  <span className="text-xs capitalize text-teal-400/80"> {item?.patient?.gender?.toLowerCase()} </span>
            </div>
        </td>

        <td className="hidden md:table-cell text-amber-400/80">
        {format(item?.appointment_date, "yyyy-MM-dd")}
        </td>

        {/* Modified this a bit make it simpler later */}

        <td className="hidden md:table-cell text-teal-400/80">
          {(() => {
            try {
              if (item?.time && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(item.time)) {
                return format(new Date(`2000-01-01T${item.time}`), "h:mm a");
              }
              return item?.time || "N/A";
            } catch (error) {
              return item?.time || "N/A";
            }
          })()}
        </td>

        <td className="hidden md:table-cell">
          <div className="flex items-center gap-2">
               <ProfileImage 
               url={item?.doctor?.img!}
               name={item?.doctor.name}
               className="bg-green-600 ring-1 ring-teal-500/30"
               />

               <div>
                    <h3 className="font-medium uppercase text-white">{item?.doctor?.name}</h3>
                    <span className="text-xs capitalize text-teal-400/80">
                      {item?.doctor?.specialization}
                    </span>
               </div>
          </div>
        </td>

        <td className="hidden xl:table-cell">
            <AppointmentStatusIndicator status={item?.status} />
        </td>

        <td>
          <div className="flex items-center gap-x-2">
            <ViewAppointment id={item?.id} />

            <Link href={`/record/appointments/${item?.id}`} className="text-teal-400 hover:text-teal-300 transition-colors duration-200 text-sm underline-offset-4 hover:underline">
            See All
            </Link>
          </div>
        </td>
        
    </tr>

    )};

  return (
    <div className="bg-black-800 rounded-xl p-2 2xl:p-4 border border-gray-800 shadow-lg">
        <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-3">
            <h1 className="sub-header text-lg font-semibold text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-teal-400 mr-2 rounded"></span>
                Recent Appointments
            </h1>

            <Button asChild variant="outline" className="bg-transparent hover:bg-teal-500/20 border-teal-500/50 text-teal-400 hover:text-teal-300 transition-all duration-300">
                <Link href="/record/appointments">View All</Link>
            </Button>
        </div>

        <Table columns={columns} renderRow={renderRow} data={data} />

    </div>
  )
}

export default RecentAppointments




{/*
import React from 'react'
import { Button } from '../ui/button';
import Link from 'next/link';
import { Table } from './table';
import { Appointment } from '@/types/data-types';
import { ProfileImage } from '../profile-image';
import { format } from 'date-fns';
import AppointmentStatusIndicator from '../appointment-status-indicator';
import ViewAppointment from '../view-appointments';


interface DataProps {
    data: any[];
}

const columns = [
    { header: "Info", key: "name" },
    {
      header: "Date",
      key: "appointment_date",
      className: "hidden md:table-cell",
    },
    {
      header: "Time",
      key: "time",
      className: "hidden md:table-cell",
    },
    {
      header: "Doctor",
      key: "doctor",
      className: "hidden md:table-cell",
    },
    {
      header: "Status",
      key: "status",
      className: "hidden xl:table-cell",
    },
    {
      header: "Actions",
      key: "action",
    },
  ];

export const RecentAppointments = ({ data }: DataProps) => {

    //console.log(data);

    const renderRow = (item: Appointment) => { 

      const name = item?.patient?.first_name + " " + item?.patient?.last_name

      return (
    
    <tr
    key={item?.id}
    className="border-b border-gray-200 even:bg-dark-300 text-sm hover:bg-teal-950"
    >

        <td className="flex items-center gap-2 2xl:gap-4 py-2 xl:py-4">
        <ProfileImage
            url={item?.patient?.img!}
            name={name}
            className="bg-green-900"
            bgColor={item?.patient?.colorCode!}
          />  
        
            <div>
                <h3 className="text-sm md:text-base md:font-medium uppercase">
                  {name}
                  </h3>
                  <span className="text-xs capitalize"> {item?.patient?.gender?.toLowerCase()} </span>
            </div>
        </td>

        <td className="hidden md:table-cell">
        {format(item?.appointment_date, "yyyy-MM-dd")}
        </td>

        <td className="hidden md:table-cell">
        {format(new Date(`2000-01-01T${item?.time}`), "h:mm a")}
        </td>

        <td className="hidden md:table-cell">
          <div className="flex items-center gap-2">
               <ProfileImage 
               url={item?.doctor?.img!}
               name={item?.doctor.name}
               className="bg-green-600"
               />

               <div>
                    <h3 className="font-medium uppercase">{item?.doctor?.name}</h3>
                    <span className="text-xs capitalize">
                      {item?.doctor?.specialization}
                    </span>
               </div>
          </div>
        </td>

        <td className="hidden xl:table-cell">
            <AppointmentStatusIndicator status={item?.status} />
        </td>

        <td>
          <div className="flex items-center gap-x-2">
            <ViewAppointment id={item?.id} />

            <Link href={`/record/appointments/${item?.id}`} className="">
            See All
            </Link>
          </div>
        </td>
        
    </tr>

    )};

  return (
    <div className="bg-black-800 rounded-xl p-2 2xl:p-4">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-lg font-semibold">Recent Appointments</h1>

            <Button asChild variant="outline">
                <Link href="/record/appointments">View All</Link>
            </Button>
        </div>

        <Table columns={columns} renderRow={renderRow} data={data} />

    </div>
  )
}

export default RecentAppointments

*/}