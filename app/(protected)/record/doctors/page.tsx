import { ActionDialog } from '@/components/action-dialog-admin';
import { ViewAction } from '@/components/action-options';
import { DoctorForm } from '@/components/forms/doctor-form';
import { Pagination } from '@/components/pagination';
import { ProfileImage } from '@/components/profile-image';
import SearchInput from '@/components/search-input';
import { Table } from '@/components/tables/table';
import { SearchParamsProps } from '@/types';
import { checkRole } from '@/utils/roles';
import { getAllDoctors } from '@/utils/services/doctor';
import { DATA_LIMIT } from '@/utils/setting';
import { Doctor } from '@prisma/client';
import { format } from 'date-fns';
import { Users } from 'lucide-react';
import React from 'react'


const columns = [
    {
      header: "Info",
      key: "name",
    },
    {
      header: "License #",
      key: "license",
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
      header: "Joined Date",
      key: "created_at",
      className: "hidden xl:table-cell",
    },
    {
      header: "Actions",
      key: "action",
    },
  ];



const DoctorsList = async(props: SearchParamsProps) => {
  /* eslint-disable */

    const searchParams = await props.searchParams;
    const page = searchParams?.p || "1" as string;
    const searchQuery = searchParams?.q || "" as string;

    const {data, totalPages, totalRecords, currentPage} = await getAllDoctors({
        page,
        search: searchQuery
    })

    if (!data) return null;

    const isAdmin = await checkRole("ADMIN")


    const renderRow = (item: Doctor) => <tr
    key={item?.id}
    className="border-b border-emerald-500/30 even:bg-emerald-900/30 text-emerald-50 hover:bg-emerald-800/40 transition-colors duration-200"
    >
        <td className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4">
            <div className="flex-shrink-0">
                <ProfileImage 
                url={item?.img!}
                name={item?.name}
                bgColor={item?.colorCode!}
                textClassName="text-black"
                />
            </div>

            <div className="min-w-0 flex-1">
                <h3 className="uppercase font-mono tracking-wider text-emerald-200 text-sm sm:text-base truncate">{item?.name}</h3>
                <span className="text-xs sm:text-sm capitalize text-emerald-300/80 block truncate">{item?.specialization}</span>
                {/* Show license and phone on mobile below name */}
                <div className="md:hidden mt-1 space-y-1">
                    <div className="text-xs text-emerald-200/90">License: {item?.license_number}</div>
                    <div className="text-xs text-emerald-300">Phone: {item?.phone}</div>
                </div>
            </div>
        </td>

        <td className="hidden md:table-cell text-emerald-200/90 p-2 sm:p-4">{item?.license_number}</td>
        
        <td className="hidden md:table-cell text-emerald-300 p-2 sm:p-4">{item?.phone}</td>
        
        <td className="hidden lg:table-cell text-emerald-200/90 p-2 sm:p-4 break-all">{item?.email}</td>

        <td className="hidden xl:table-cell text-emerald-300/90 p-2 sm:p-4">{format(item?.created_at, "yyyy-MM-dd")}</td>
        
        <td className="p-2 sm:p-4">
            <div className="flex items-center gap-1 sm:gap-2 justify-end">
                <ViewAction href={`doctors/${item?.id}`}/>
                {isAdmin && <ActionDialog type="delete" id={item?.id} deleteType="doctor" />} 
            </div>
        </td>
    </tr>;

    return (
        <div className="py-3 sm:py-6 px-2 sm:px-3 2xl:px-6 bg-gray-900/60 border border-emerald-500/40 rounded-xl shadow-lg relative backdrop-blur-sm mx-2 sm:mx-0">
            {/* Minecraft-style decorative elements - hide on very small screens */}
            <div className="hidden sm:block absolute top-0 left-0 w-8 sm:w-12 h-8 sm:h-12 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
            <div className="hidden sm:block absolute top-0 right-0 w-8 sm:w-12 h-8 sm:h-12 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
            <div className="hidden sm:block absolute bottom-0 left-0 w-8 sm:w-12 h-8 sm:h-12 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
            <div className="hidden sm:block absolute bottom-0 right-0 w-8 sm:w-12 h-8 sm:h-12 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
            
            {/* Enhanced emerald glow effects - adjusted for mobile */}
            <div className="absolute -top-3 sm:-top-5 right-5 sm:right-10 w-20 sm:w-32 h-20 sm:h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-3 sm:-bottom-5 left-10 sm:left-20 w-20 sm:w-32 h-20 sm:h-32 bg-emerald-200/15 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 relative z-10">
                <div className="flex lg:hidden items-center gap-1 bg-gradient-to-r from-emerald-900/70 to-emerald-950/60 p-2 sm:p-3 rounded-lg border border-emerald-500/30 w-full sm:w-auto">
                    <Users size={16} className="text-emerald-400 sm:hidden" />
                    <Users size={20} className="text-emerald-400 hidden sm:block" />
                    <p className="text-lg sm:text-2xl font-semibold text-emerald-100">{totalRecords}</p>
                    <span className="text-emerald-300 text-xs sm:text-sm font-mono tracking-wide">
                        Total doctors
                    </span>
                </div>
                
                <div className="hidden lg:flex items-center gap-1 bg-gradient-to-r from-emerald-900/70 to-emerald-950/60 p-3 rounded-lg border border-emerald-500/30">
                    <Users size={20} className="text-emerald-400" />
                    <p className="text-2xl font-semibold text-emerald-100">{totalRecords}</p>
                    <span className="text-emerald-300 text-sm xl:text-base font-mono tracking-wide">
                        Total doctors
                    </span>
                </div>
                
                <div className="w-full sm:w-full lg:w-fit flex flex-col sm:flex-row items-stretch sm:items-center justify-between lg:justify-start gap-2">
                    <div className="flex-1 sm:flex-initial">
                        <SearchInput />
                    </div>
                    {isAdmin && (
                        <div className="flex-shrink-0">
                            <DoctorForm />
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 sm:mt-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-2 sm:p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
                <div className="absolute -left-2 sm:-left-4 h-4 sm:h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wider pl-1 sm:pl-2 font-mono uppercase mb-3 sm:mb-4">Doctor Registry</h2>
                
                <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <div className="min-w-full">
                        <Table columns={columns} data={data} renderRow={renderRow} />
                    </div>
                </div>

                {
                    totalPages && <div className="mt-4 overflow-x-auto">
                        <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        totalRecords={totalRecords}
                        limit={DATA_LIMIT}
                        />
                    </div>
                }
            </div>
        </div>
    )
}

export default DoctorsList