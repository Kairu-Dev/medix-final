import { ActionDialog } from '@/components/action-dialog-admin';
import { ActionOptions, ViewAction } from '@/components/action-options';
import { Pagination } from '@/components/pagination';
import { ProfileImage } from '@/components/profile-image';
import SearchInput from '@/components/search-input';
import { Table } from '@/components/tables/table';
import { Button } from '@/components/ui/button';
import { SearchParamsProps } from '@/types';
import { calculateAge } from '@/utils';
import { checkRole } from '@/utils/roles';
import { getAllPatients } from '@/utils/services/patientFetchInfo';
import { DATA_LIMIT } from '@/utils/setting';
import { Patient } from '@prisma/client';
import { format } from 'date-fns';
import { UserPen, Users } from 'lucide-react';
import React from 'react'


const columns = [
    {
      header: "Patient Name",
      key: "name",
    },
    {
      header: "Gender",
      key: "gender",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      key: "contact",
      className: "hidden md:table-cell",
    },
    {
      header: "Email",
      key: "email",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      key: "address",
      className: "hidden xl:table-cell",
    },
    {
      header: "Last Visit",
      key: "created_at",
      className: "hidden lg:table-cell",
    },

    {
      header: "Actions",
      key: "action",
    },
  ];


  interface PatientProps extends Patient {
    appointments: {
      medical: {
        created_at: Date;
        treatment_plan: string;
      }[];
    }[];
  }
  


  const PatientList = async(props: SearchParamsProps) => {

    const searchParams = await props.searchParams;
    const page = searchParams?.p || "1" as string;
    const searchQuery = searchParams?.q || "" as string;
    /* eslint-disable */

    const {data, totalPages, totalRecords, currentPage} = await getAllPatients({
        page,
        search: searchQuery
    })

    const isAdmin = await checkRole("ADMIN")

    if (!data) return null;

    const renderRow = (item: PatientProps) => {
        const lastVisit = item?.appointments[0]?.medical[0] || null;

        const name = item?.first_name + " " + item?.last_name;
       return (
    <tr
    key={item?.id}
    className="border-b border-emerald-500/30 even:bg-emerald-900/30 text-emerald-50 hover:bg-emerald-800/40 transition-colors duration-200"
    >
        <td className="flex items-center gap-4 p-4">
            <ProfileImage 
            url={item?.img!}
            name={name}
            bgColor={item?.colorCode!}
            textClassName="text-black"
            />

            <div>
                <h3 className="uppercase font-mono tracking-wider text-emerald-200">{name}</h3>
                <span className="text-sm capitalize text-emerald-300/80">{calculateAge(item?.date_of_birth)}</span>
            </div>
        </td>

        <td className="hidden md:table-cell text-emerald-200/90">{item?.gender}</td>
        
        <td className="hidden md:table-cell text-emerald-300">{item?.phone}</td>
        
        <td className="hidden lg:table-cell text-emerald-200/90">{item?.email}</td>
        <td className="hidden xl:table-cell text-emerald-200/90">{item?.address}</td>

        <td className="hidden xl:table-cell text-emerald-300/90">{
            lastVisit ? format(lastVisit?.created_at, "yyyy-MM-dd HH:mm:ss") : <span className="text-gray-400 italic">No last Visit</span>
        }</td>

        
        <td>
            <div className="flex items-center gap-2">
                <ViewAction href={`/patient/${item?.id}`} />
                <ActionOptions>
                    <div className="space-y-3">

                        <Button className="text-sm font-medium">
                            <UserPen size={16} className="text-emerald-300"/>
                            Edit
                        </Button>

                        {
                            isAdmin && <ActionDialog 
                            type="delete"
                            id={item.id}
                            deleteType="patient"
            
                            />
                        }

                    </div>
                </ActionOptions>
            </div>
        </td>
    </tr>

    )};

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
                    <Users size={20} className="text-emerald-400" />
                    <p className="text-2xl font-semibold text-emerald-100">{totalRecords}</p>
                    <span className="text-emerald-300 text-sm xl:text-base font-mono tracking-wide">
                        Total Patients
                    </span>
                </div>
                <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
                    <SearchInput />
                </div>
            </div>

            <div className="mt-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
                <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
                <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">Patient Registry</h2>
                
                <Table columns={columns} data={data} renderRow={renderRow} />

                {
                    totalPages && <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    totalRecords={totalRecords}
                    limit={DATA_LIMIT}
                    />
                }
            </div>
        </div>
    )
}

export default PatientList

{/* 

  import { ActionDialog } from '@/components/action-dialog-admin';
import { ActionOptions, ViewAction } from '@/components/action-options';
import { Pagination } from '@/components/pagination';
import { ProfileImage } from '@/components/profile-image';
import SearchInput from '@/components/search-input';
import { Table } from '@/components/tables/table';
import { Button } from '@/components/ui/button';
import { SearchParamsProps } from '@/types';
import { calculateAge } from '@/utils';
import { checkRole } from '@/utils/roles';
import { getAllPatients } from '@/utils/services/patientFetchInfo';
import { DATA_LIMIT } from '@/utils/setting';
import { Patient } from '@prisma/client';
import { format } from 'date-fns';
import { UserPen, Users } from 'lucide-react';
import React from 'react'


const columns = [
    {
      header: "Patient Name",
      key: "name",
    },
    {
      header: "Gender",
      key: "gender",
      className: "hidden md:table-cell",
    },
    {
      header: "Phone",
      key: "contact",
      className: "hidden md:table-cell",
    },
    {
      header: "Email",
      key: "email",
      className: "hidden lg:table-cell",
    },
    {
      header: "Address",
      key: "address",
      className: "hidden xl:table-cell",
    },
    {
      header: "Last Visit",
      key: "created_at",
      className: "hidden lg:table-cell",
    },
    {
      header: "Last Treatment",
      key: "treatment",
      className: "hidden 2xl:table-cell",
    },
    {
      header: "Actions",
      key: "action",
    },
  ];


  interface PatientProps extends Patient {
    appointments: {
      medical: {
        created_at: Date;
        treatment_plan: string;
      }[];
    }[];
  }
  


  const PatientList = async(props: SearchParamsProps) => {

    const searchParams = await props.searchParams;
    const page = searchParams?.p || "1" as string;
    const searchQuery = searchParams?.q || "" as string;


    const {data, totalPages, totalRecords, currentPage} = await getAllPatients({
      page,
      search: searchQuery
  })

  const isAdmin = await checkRole("ADMIN")

  if (!data) return null;

  const renderRow = (item: PatientProps) => {
      const lastVisit = item?.appointments[0]?.medical[0] || null;

      const name = item?.first_name + " " + item?.last_name;
     return (
  <tr
  key={item?.id}
  className="border-b border-emerald-500/30 even:bg-emerald-900/30 text-emerald-50 hover:bg-emerald-800/40 transition-colors duration-200"
  >
      <td className="flex items-center gap-4 p-4">
          <ProfileImage 
          url={item?.img!}
          name={name}
          bgColor={item?.colorCode!}
          textClassName="text-black"
          />

          <div>
              <h3 className="uppercase font-mono tracking-wider text-emerald-200">{name}</h3>
              <span className="text-sm capitalize text-emerald-300/80">{calculateAge(item?.date_of_birth)}</span>
          </div>
      </td>

      <td className="hidden md:table-cell text-emerald-200/90">{item?.gender}</td>
      
      <td className="hidden md:table-cell text-emerald-300">{item?.phone}</td>
      
      <td className="hidden lg:table-cell text-emerald-200/90">{item?.email}</td>
      <td className="hidden xl:table-cell text-emerald-200/90">{item?.address}</td>

      <td className="hidden xl:table-cell text-emerald-300/90">{
          lastVisit ? format(lastVisit?.created_at, "yyyy-MM-dd HH:mm:ss") : <span className="text-gray-400 italic">No last Visit</span>
      }</td>

      <td className="hidden xl:table-cell text-emerald-300/90">
      {lastVisit ? (
        lastVisit?.treatment_plan 
      ) : ( <span className="text-gray-400 italic">No last treatment</span>
      )}</td>
      
      <td>
          <div className="flex items-center gap-2">
              <ViewAction href={`/patient/${item?.id}`} />
              <ActionOptions>
                  <div className="space-y-3">

                      <Button className="text-sm font-medium">
                          <UserPen size={16} className="text-emerald-300"/>
                          Edit
                      </Button>

                      {
                          isAdmin && <ActionDialog 
                          type="delete"
                          id={item.id}
                          deleteType="patient"
          
                          />
                      }

                  </div>
              </ActionOptions>
          </div>
      </td>
  </tr>

  )};

  return (
      <div className="py-6 px-3 2xl:px-6 bg-gray-900/60 border border-emerald-500/40 rounded-xl shadow-lg relative backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
          
          <div className="absolute -top-5 right-10 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-5 left-20 w-32 h-32 bg-emerald-200/15 rounded-full blur-3xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
              <div className="hidden lg:flex items-center gap-1 bg-gradient-to-r from-emerald-900/70 to-emerald-950/60 p-3 rounded-lg border border-emerald-500/30">
                  <Users size={20} className="text-emerald-400" />
                  <p className="text-2xl font-semibold text-emerald-100">{totalRecords}</p>
                  <span className="text-emerald-300 text-sm xl:text-base font-mono tracking-wide">
                      Total Patients
                  </span>
              </div>
              <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
                  <SearchInput />
              </div>
          </div>

          <div className="mt-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
              <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
              <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">Patient Registry</h2>
              
              <Table columns={columns} data={data} renderRow={renderRow} />

              {
                  totalPages && <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  totalRecords={totalRecords}
                  limit={DATA_LIMIT}
                  />
              }
          </div>
      </div>
  )
}

export default PatientList */}

  
