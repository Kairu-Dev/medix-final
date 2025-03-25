import { ActionDialog } from '@/components/action-dialog-admin';
import { ViewAction } from '@/components/action-options';
import { DoctorForm } from '@/components/forms/doctor-form';
import { StaffForm } from '@/components/forms/staff-form';
import { Pagination } from '@/components/pagination';
import { ProfileImage } from '@/components/profile-image';
import SearchInput from '@/components/search-input';
import { Table } from '@/components/tables/table';
import { Button } from '@/components/ui/button';
import { SearchParamsProps } from '@/types';
import { checkRole } from '@/utils/roles';
import { getAllDoctors } from '@/utils/services/doctor';
import { getAllStaff } from '@/utils/services/staff';
import { DATA_LIMIT } from '@/utils/setting';
import { Doctor, Staff } from '@prisma/client';
import { format } from 'date-fns';
import { BriefcaseBusiness, Users } from 'lucide-react';
import React from 'react'


const columns = [
    {
      header: "Info",
      key: "name",
    },
    {
      header: "Role",
      key: "role",
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
  


  const StaffList = async(props: SearchParamsProps) => {

    const searchParams = await props.searchParams;
    const page = searchParams?.p || "1" as string;
    const searchQuery = searchParams?.q || "" as string;

    const {data, totalPages, totalRecords, currentPage} = await getAllStaff({
        page,
        search: searchQuery
    })

    if (!data) return null;

    const isAdmin = await checkRole("ADMIN")


    const renderRow = (item: Staff) => <tr
    key={item?.id}
    className="border-b border-emerald-500/30 even:bg-emerald-900/30 text-emerald-50 hover:bg-emerald-800/40 transition-colors duration-200"
    >
        <td className="flex items-center gap-4 p-4">
            <ProfileImage 
            url={item?.img!}
            name={item?.name}
            bgColor={item?.colorCode!}
            textClassName="text-black"
            />

            <div>
                <h3 className="uppercase font-mono tracking-wider text-emerald-200">{item?.name}</h3>
                <span className="text-sm capitalize text-emerald-300/80">{item?.phone}</span>
            </div>
        </td>

        <td className="hidden md:table-cell text-emerald-200/90">{item?.role}</td>
        
        <td className="hidden md:table-cell text-emerald-300">{item?.phone}</td>
        
        <td className="hidden lg:table-cell text-emerald-200/90">{item?.email}</td>

        <td className="hidden xl:table-cell text-emerald-300/90">{format(item?.created_at, "yyyy-MM-dd")}</td>
        
        <td>
            <div className="flex items-center gap-2">
                <ActionDialog type="staff" id={item?.id} data={item} />
                {isAdmin && <ActionDialog type="delete" id={item?.id} deleteType="staff" />} 
            </div>
        </td>
    </tr>;

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
                        Total Staffs
                    </span>
                </div>
                <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
                    <SearchInput />
                    {isAdmin && <StaffForm/>}
                </div>
            </div>

            <div className="mt-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
                <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
                <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">Staff Registry</h2>
                
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

export default StaffList
