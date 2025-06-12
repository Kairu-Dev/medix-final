/* eslint-disable */
import { AppointmentActionOptions } from '@/components/appointment-actions-options';
import AppointmentContainer from '@/components/appointment-container';
import AppointmentStatusIndicator from '@/components/appointment-status-indicator';
import AppointmentPriorityIndicator from '@/components/AppointmentPriorityIndicator';
import { Pagination } from '@/components/pagination';
import { ProfileImage } from '@/components/profile-image';
import AdvancedSearchInput from '@/components/advanced-search-input';
import { Table } from '@/components/tables/table';
import ViewAppointment from '@/components/view-appointments';
import { checkRole, getRole } from '@/utils/roles';
import { getPatientAppointments } from '@/utils/services/appointment';
import { DATA_LIMIT } from '@/utils/setting';
import { auth } from '@clerk/nextjs/server';
import { PriorityLevel } from '@prisma/client';
import { formatDate } from 'date-fns';
import { AlertCircle, AlertTriangle, Calendar, CircleCheck, FileBarChart, Filter, X } from 'lucide-react';
import React from 'react'

const columns = [
    {
      header: "Info",
      key: "name",
    },
    {
      header: "Scheduled Date",
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
      header: "Priority Level",
      key: "priority",
      className: "hidden lg:table-cell",
    },
    {
      header: "Actions",
      key: "action",
    },
  ];

  interface DataProps {
    id: number;
    patient_id: string;
    doctor_id: string;
    appointment_date: Date;
    time: string;
    status: any;
    type: string;
    priority_level: PriorityLevel;
    priority_score: number;
    priority_override: boolean;
    booked_by?: string | null;
    patient: {
      id: string;
      first_name: string;
      last_name: string;
      phone: string;
      gender: string;
      img: string | null;
      date_of_birth: Date;
      colorCode: string | null;
    };
    doctor: {
      id: string;
      name: string;
      specialization: string;
      colorCode: string | null;
      img: string | null;
    };
    bookedByStaff?: {
      id: string;
      name: string;
      role: string;
    } | null;
  }

// Define the type for priority counts
type PriorityCountsType = {
  [key in PriorityLevel]?: number;
};

const Appointments = async (props: {
  searchParams?: Promise<{ [key:string]: string | undefined }>;
}) => {
    const searchParams = await props.searchParams;
    const userRole = await getRole();
    const {userId} = await auth();
    const isPatient = await checkRole("PATIENT");
    const isAdmin = await checkRole("ADMIN");

    const page = (searchParams?.p || "1") as string;
    
    // Enhanced search query handling for advanced search
    const searchQuery = searchParams?.q || "";
    const fromQuery = searchParams?.from || "";
    const doctorQuery = searchParams?.doctor || "";
    const statusQuery = searchParams?.status || "";
    const priorityQuery = searchParams?.priority || "";
    const dateQuery = searchParams?.date || "";
    const timeQuery = searchParams?.time || "";
    const typeQuery = searchParams?.type || "";
    
    const id = searchParams?.id || undefined;
    
    let queryId = undefined;
    
    // Determine queryId based on user role and context
    if (userRole === "admin") {
        queryId = id; // Admin can see all or filter by id
    } else if (userRole === "doctor") {
        queryId = userId; // Doctors see their own appointments by default
        if (id) {
            queryId = id; // Allow override if specific id is provided
        }
    } else if (userRole === "patient") {
        queryId = userId; // Patients only see their own appointments
    } else if (userRole === "nurse") {
        queryId = id; // Nurses see all or filtered by id
    }

    console.log("Final Query ID:", queryId);
    console.log("Advanced Search Params:", {
        q: searchQuery,
        from: fromQuery,
        doctor: doctorQuery,
        status: statusQuery,
        priority: priorityQuery,
        date: dateQuery,
        time: timeQuery,
        type: typeQuery
    });
    
    // Build filters object for the API
    const filters = {
        status: statusQuery,
        priority: priorityQuery,
        date: dateQuery,
        time: timeQuery,
        type: typeQuery,
        from: fromQuery,
        doctor: doctorQuery,
    };

    // Remove empty filter values
    const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value && value.trim() !== "")
    );
    
    // Call the API with all parameters
    const response = await getPatientAppointments({
        page, 
        search: searchQuery, // General search query
        id: queryId!,
        filters: cleanFilters, // Pass cleaned filters
    });
    
    console.log("API Response:", response);
    console.log("Data Length:", response?.data?.length);

    const data = response.data || [];
    const totalPages = response.totalPages || 0;
    const totalRecord = response.totalRecord || 0;
    const currentPage = response.currentPage || 1;

    // Count appointments by priority level with proper type safety
    const priorityCounts: PriorityCountsType = data.reduce((acc: PriorityCountsType, item: DataProps) => {
        const level = item.priority_level;
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {});

    // Check if any filters are active
    const hasActiveFilters = Object.values(cleanFilters).some(value => value && value.trim() !== "") || searchQuery.trim() !== "";

    // Create filter display items
    const activeFilters = [
        { key: 'Search', value: searchQuery, color: 'emerald' },
        { key: 'Patient', value: fromQuery, color: 'blue' },
        { key: 'Doctor', value: doctorQuery, color: 'purple' },
        { key: 'Status', value: statusQuery, color: 'yellow' },
        { key: 'Priority', value: priorityQuery, color: 'red' },
        { key: 'Date', value: dateQuery, color: 'indigo' },
        { key: 'Time', value: timeQuery, color: 'pink' },
        { key: 'Type', value: typeQuery, color: 'green' },
    ].filter(filter => filter.value && filter.value.trim() !== '');

    const renderItem = (item: DataProps) => {
      const patient_name = `${item.patient.first_name} ${item.patient.last_name}`;
      return <tr key={item.id}
      className="border-b border-emerald-500/30 even:bg-emerald-900/30 text-emerald-50 hover:bg-emerald-800/40 transition-colors duration-200"
      >
      <td className="flex items-center gap-2 md:gap-4 py-2 xl:py-4">
        <ProfileImage
          url={item.patient.img || undefined}
          name={patient_name}
          bgColor={item.patient.colorCode || undefined}
        />
        <div>
          <h3 className="uppercase font-mono tracking-wider text-emerald-200">{patient_name}</h3>
          <div className="flex flex-col">
            <span className="text-xs md:text-sm capitalize text-emerald-300/80">
              {item.patient.gender.toLowerCase()}
            </span>
            {item.bookedByStaff && (
              <span className="text-xs text-amber-400/80">
                Booked by: {item.bookedByStaff.name} ({item.bookedByStaff.role})
              </span>
            )}
          </div>
        </div>
      </td>

        <td className="hidden md:table-cell text-emerald-200/90">
           {formatDate(item.appointment_date, "yyyy-MM-dd")}
        </td>

        <td className="hidden md:table-cell text-emerald-300">{item.time}</td>

        <td className="hidden items-center py-2 md:table-cell">
            <div className="flex items-center gap-2 md:gap-4">
                <ProfileImage 
                url={item.doctor.img || undefined}
                name={item.doctor.name}
                bgColor={item.doctor.colorCode || undefined}
                textClassName="text-black"
                />
            
            <div>
              <h3 className="uppercase font-mono tracking-wider text-emerald-200">{item.doctor.name}</h3>
              <span className="text-xs md:text-sm capitalize text-emerald-300/80">
                {item.doctor.specialization}
              </span>
            </div>
            </div>
        </td>

        <td className="hidden xl:table-cell">
            <AppointmentStatusIndicator status={item.status} />
        </td>

        <td className="hidden lg:table-cell">
            <AppointmentPriorityIndicator 
              priorityLevel={item.priority_level}
              priorityScore={item.priority_score}
              priorityOverride={item.priority_override}
            />
        </td>
        
        <td>
            <div className="flex items-center gap-2">
                <ViewAppointment id={item.id.toString()} />
                <AppointmentActionOptions 
                userId={userId!}
                patientId={item.patient_id}
                doctorId={item.doctor_id}
                status={item.status}
                appointmentId={item.id}
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
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-900/70 to-emerald-950/60 p-3 rounded-lg border border-emerald-500/30">
                    <Calendar size={20} className="text-emerald-400" />
                    <p className="text-2xl font-semibold text-emerald-100">{totalRecord}</p>
                    <span className="text-emerald-300 text-sm xl:text-base font-mono tracking-wide">
                        Total appointments
                    </span>
                </div>
                
                {/* Priority Summary Cards - Only visible to admin users */}
                {isAdmin && (
                  <>
                    <div className="flex items-center gap-1 bg-gradient-to-r from-blue-900/70 to-blue-950/60 p-3 rounded-lg border border-blue-500/30">
                        <CircleCheck size={20} className="text-blue-400" />
                        <p className="text-2xl font-semibold text-blue-100">{priorityCounts['NORMAL'] || 0}</p>
                        <span className="text-blue-300 text-sm xl:text-base font-mono tracking-wide">
                            Normal
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-gradient-to-r from-amber-900/70 to-amber-950/60 p-3 rounded-lg border border-amber-500/30">
                        <AlertTriangle size={20} className="text-amber-400" />
                        <p className="text-2xl font-semibold text-amber-100">{priorityCounts['URGENT'] || 0}</p>
                        <span className="text-amber-300 text-sm xl:text-base font-mono tracking-wide">
                            Urgent
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-gradient-to-r from-red-900/70 to-red-950/60 p-3 rounded-lg border border-red-500/30">
                        <AlertCircle size={20} className="text-red-400" />
                        <p className="text-2xl font-semibold text-red-100">{priorityCounts['EMERGENCY'] || 0}</p>
                        <span className="text-red-300 text-sm xl:text-base font-mono tracking-wide">
                            Emergency
                        </span>
                    </div>
                  </>
                )}
                
                {/* Filter indicator */}
                {hasActiveFilters && (
                  <div className="flex items-center gap-1 bg-gradient-to-r from-cyan-900/70 to-cyan-950/60 p-3 rounded-lg border border-cyan-500/30">
                      <Filter size={20} className="text-cyan-400" />
                      <p className="text-2xl font-semibold text-cyan-100">{activeFilters.length}</p>
                      <span className="text-cyan-300 text-sm xl:text-base font-mono tracking-wide">
                          Active filters
                      </span>
                  </div>
                )}
            </div>

            <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
                <AdvancedSearchInput />
                {isPatient && <AppointmentContainer id={userId!}/>}
            </div>
        </div>

        <div className="mt-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
            <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase">Appointment Registry</h2>
                {isAdmin && (
                  <div className="flex items-center gap-2 text-emerald-300 text-sm">
                      <FileBarChart size={16} />
                      <span>Priority view enabled</span>
                  </div>
                )}
            </div>
            
            {/* Show applied filters with improved styling */}
            {hasActiveFilters && (
              <div className="mb-4 p-4 bg-emerald-900/40 rounded-lg border border-emerald-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-emerald-300 text-sm font-semibold flex items-center gap-2">
                    <Filter size={14} />
                    Active Filters ({activeFilters.length})
                  </h3>
                  <a 
                    href="?" 
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline"
                  >
                    <X size={12} />
                    Clear all
                  </a>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeFilters.map((filter, index) => (
                    <div key={index} className={`px-3 py-2 bg-${filter.color}-700/50 text-${filter.color}-200 text-xs rounded-full border border-${filter.color}-500/50 flex items-center gap-2`}>
                      <span className="font-medium">{filter.key}:</span>
                      <span className="truncate max-w-32">{filter.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Results summary */}
            {hasActiveFilters && (
              <div className="mb-4 p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/20">
                <p className="text-emerald-300 text-sm">
                  {data.length > 0 
                    ? `Found ${totalRecord} appointment${totalRecord !== 1 ? 's' : ''} matching your search criteria`
                    : 'No appointments found matching your search criteria'
                  }
                </p>
              </div>
            )}
            
            {/* Table or no data message */}
            {data?.length > 0 ? (
              <Table 
                columns={columns}
                renderRow={renderItem}
                data={data}
              />
            ) : (
              <div className="flex flex-col justify-center items-center p-12 bg-emerald-900/20 rounded-lg border border-emerald-500/30">
                <Calendar size={48} className="text-emerald-400/50 mb-4" />
                <p className="text-emerald-300 text-lg mb-2">
                  {hasActiveFilters ? 'No appointments match your search' : 'No appointments found'}
                </p>
                <p className="text-emerald-400/70 text-sm text-center">
                  {hasActiveFilters 
                    ? 'Try adjusting your search criteria or clear the filters to see all appointments'
                    : 'Appointments will appear here when they are scheduled'
                  }
                </p>
                {hasActiveFilters && (
                  <a 
                    href="?" 
                    className="mt-4 px-4 py-2 bg-emerald-700/50 text-emerald-200 text-sm rounded-lg hover:bg-emerald-600/50 transition-colors"
                  >
                    Clear all filters
                  </a>
                )}
              </div>
            )}

            {data?.length > 0 && (
              <Pagination
                totalRecords={totalRecord}
                currentPage={currentPage}
                totalPages={totalPages}
                limit={DATA_LIMIT}
              />
            )}
        </div>
    </div>
  )
}

export default Appointments