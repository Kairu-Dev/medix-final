import { AppointmentActionOptions } from '@/components/appointment-actions-options';
import AppointmentContainer from '@/components/appointment-container';
import AppointmentStatusIndicator from '@/components/appointment-status-indicator';
import { Pagination } from '@/components/pagination';
import { ProfileImage } from '@/components/profile-image';
import SearchInput from '@/components/search-input';
import { Table } from '@/components/tables/table';
import ViewAppointment from '@/components/view-appointments';
import { checkRole, getRole } from '@/utils/roles';
import { getPatientAppointments } from '@/utils/services/appointment';
import { DATA_LIMIT } from '@/utils/setting';
import { auth } from '@clerk/nextjs/server';
import { Appointment, Doctor, Patient } from '@prisma/client';
import { formatDate } from 'date-fns';
import { Calendar } from 'lucide-react';
import React from 'react'

const columns = [
    {
      header: "Info",
      key: "name",
    },
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

  interface DataProps extends Appointment {
    patient: Patient;
    doctor: Doctor;
  }
  

const Appointments = async (props: {
  searchParams?: Promise<{ [key:string]: string | undefined } >;

}) => {
    /* eslint-disable */
    const searchParams = await props.searchParams;
    const userRole = await getRole();
    const {userId} = await auth();
    const isPatient = await checkRole("PATIENT");

    const page = (searchParams?.p || "1") as string;
    const searchQuery = searchParams?.q || "";
    const id = searchParams?.id || undefined;
    
    let queryId = undefined

    if (userRole == "admin" || userRole == "doctor" && id || (userRole === "nurse" && id)) {
        queryId = id;
    } else if(userRole === "doctor" || userRole === "patient") {
        queryId = userId;
    } else if(userRole === "nurse") {
        queryId = undefined;
    }

    const {data, totalPages, totalRecord, currentPage} = await getPatientAppointments({
        page, 
        search:searchQuery, 
        id:queryId!,
    });

    if(!data) return null;


    const renderItem = (item: DataProps) => {
        const patient_name = `${item?.patient?.first_name}  ${item?.patient?.last_name}`;
        return <tr key={item?.id}
        className="border-b border-emerald-500/30 even:bg-emerald-900/30 text-emerald-50 hover:bg-emerald-800/40 transition-colors duration-200"
        >
        <td className="flex items-center gap-2 md:gap-4 py-2 xl:py-4">
          <ProfileImage
            url={item?.patient?.img!}
            name={patient_name}
            bgColor={item?.patient?.colorCode!}
          />
          <div>
            
            <h3 className="uppercase font-mono tracking-wider text-emerald-200">{patient_name}</h3>
            <span className="text-xs md:text-sm capitalize text-emerald-300/80">
              {item?.patient?.gender.toLowerCase()}
            </span>
          </div>
        </td>

        <td className="hidden md:table-cell text-emerald-200/90">
           {formatDate(item?.appointment_date, "yyyy-MM-dd hh:mm a")}
        </td>

        <td className="hidden md:table-cell text-emerald-300">{item.time}</td>

        <td className="hidden items-center py-2 md:table-cell">
            <div className="flex items-center gap-2 md:gap-4">
                <ProfileImage 
                url={item.doctor?.img!}
                name={item.doctor?.name}
                bgColor={item?.doctor?.colorCode!}
                textClassName="text-black"
                />
            
            <div>
              <h3 className="uppercase font-mono tracking-wider text-emerald-200">{item.doctor?.name}</h3>
              <span className="text-xs md:text-sm capitalize text-emerald-300/80">
                {item.doctor?.specialization}
              </span>
            </div>
            </div>
        </td>

        <td className="hidden xl:table-cell">
            <AppointmentStatusIndicator status={item.status!} />
        </td>
        
        <td>
            <div className="flex items-center gap-2">
                <ViewAppointment id={item?.id.toString()} />
                <AppointmentActionOptions 
                userId={userId!}
                patientId={item?.patient_id}
                doctorId={item?.doctor_id}
                status={item?.status}
                appointmentId={item?.id}
                
                />
            </div>
        </td>

        </tr>;
    };


  return (
    <div className="py-6 px-3 2xl:px-6 bg-gray-900/60 border border-emerald-500/40 rounded-xl shadow-lg relative backdrop-blur-sm">
        {/* Minecraft-style decorative elements */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
        
        {/* Enhanced emerald glow effects */}
        <div className="absolute -top-5 right-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-5 left-20 w-32 h-32 bg-emerald-200/15 rounded-full blur-3xl"></div>
        
        <div className="flex items-center justify-between relative z-10">
            <div className="hidden lg:flex items-center gap-1 bg-gradient-to-r from-emerald-900/70 to-emerald-950/60 p-3 rounded-lg border border-emerald-500/30">
                <Calendar size={20} className="text-emerald-400" />
                <p className="text-2xl font-semibold text-emerald-100">{totalRecord ?? 0}</p>
                <span className="text-emerald-300 text-sm xl:text-base font-mono tracking-wide">
                    Total appointments
                </span>
            </div>

            <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
                <SearchInput /> 
                {isPatient && <AppointmentContainer id={userId!}/>}
            </div>
        </div>

        <div className="mt-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
            <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
            <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">Appointment Registry</h2>
            
            <Table 
            columns={columns}
            renderRow={renderItem}
            data={data}
            />

            {data?.length > 0 && (
              <Pagination
              totalRecords={totalRecord!}
              currentPage={currentPage!}
              totalPages={totalPages!}
              limit={DATA_LIMIT}
              />
            )}
        </div>
    </div>
  )
}

export default Appointments