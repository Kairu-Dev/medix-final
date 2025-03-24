import { Table } from '@/components/tables/table';
import { clerkClient } from '@clerk/nextjs/server';
import { format } from 'date-fns';
import { BriefcaseBusiness } from 'lucide-react';
import React from 'react'

const columns = [
    {
      header: "user ID",
      key: "id",
      className: "hidden lg:table-cell",
    },
    {
      header: "Name",
      key: "name",
    },
    {
      header: "Email",
      key: "email",
      className: "hidden md:table-cell",
    },
    {
      header: "Role",
      key: "role",
    },
    {
      header: "Status",
      key: "status",
    },
    {
      header: "Last Login",
      key: "last_login",
      className: "hidden xl:table-cell",
    },
  ];

  interface UserProps {
    id: string;
    firstName: string;
    lastName: string;
    emailAddresses: { emailAddress: string }[];
    publicMetadata: { role: string };
    lastSignInAt: number | string;
  }

const UserPage = async() => {

    const client = await clerkClient()

    const {data, totalCount} = await client.users.getUserList ({
        orderBy:"-created_at"

    });


    const renderRow = (item: UserProps) => (

        <tr
            key={item.id}
            className="border-b border-emerald-500/30 even:bg-emerald-900/30 text-emerald-50 hover:bg-emerald-800/40 transition-colors duration-200"
            >

            <td className="hidden lg:table-cell items-center text-emerald-200/70 font-mono text-sm">{item?.id}</td>
            <td className="py-2 xl:py-4 table-cell items-center text-emerald-100 font-medium">{item?.firstName} {item?.lastName}</td>
            <td className="table-cell capitalize text-emerald-200">{item?.emailAddresses[0].emailAddress}</td>
            <td className="table-cell capitalize text-emerald-300 font-medium">{item?.publicMetadata.role}</td>
            <td className="table-cell capitalize">
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/30">
                Active
              </span>
            </td>
            <td className="table-cell text-emerald-200/80 font-mono text-sm">{format(item?.lastSignInAt, "yyyy-MM-dd h:mm:ss")}</td>

        </tr>
    );

  return (
    <div className="py-6 px-3 2xl:px-6 bg-gray-900/60 border border-emerald-500/40 rounded-xl shadow-lg relative backdrop-blur-sm">
        {/* Minecraft-style decorative elements */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
        
        {/* Enhanced emerald glow effects */}
        <div className="absolute -top-5 left-20 w-32 h-32 bg-emerald-300/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-5 right-20 w-32 h-32 bg-emerald-200/15 rounded-full blur-3xl"></div>

        <div className="flex items-center justify-between relative z-10">
            <div className="hidden lg:flex items-center gap-1 bg-gradient-to-r from-emerald-900/70 to-emerald-950/60 p-3 rounded-lg border border-emerald-500/30">
                <BriefcaseBusiness size={20} className="text-emerald-400" />
                <p className="text-2xl font-semibold text-emerald-100">{totalCount}</p>
                <span className="text-emerald-300 text-sm xl:text-base font-mono tracking-wide">
                    Total Users
                </span>
            </div>
        </div>

        <div className="mt-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
            <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
            <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">User Management</h2>
            
            <Table columns={columns} data={data} renderRow={renderRow}/>
        </div>

    </div>
  )
}

export default UserPage



{/*
import { Table } from '@/components/tables/table';
import { clerkClient } from '@clerk/nextjs/server';
import { format } from 'date-fns';
import { BriefcaseBusiness } from 'lucide-react';
import React from 'react'

const columns = [
    {
      header: "user ID",
      key: "id",
      className: "hidden lg:table-cell",
    },
    {
      header: "Name",
      key: "name",
    },
    {
      header: "Email",
      key: "email",
      className: "hidden md:table-cell",
    },
    {
      header: "Role",
      key: "role",
    },
    {
      header: "Status",
      key: "status",
    },
    {
      header: "Last Login",
      key: "last_login",
      className: "hidden xl:table-cell",
    },
  ];

  interface UserProps {
    id: string;
    firstName: string;
    lastName: string;
    emailAddresses: { emailAddress: string }[];
    publicMetadata: { role: string };
    lastSignInAt: number | string;
  }

const UserPage = async() => {

    const client = await clerkClient()

    const {data, totalCount} = await client.users.getUserList ({
        orderBy:"-created_at"

    });


    const renderRow = (item: UserProps) => (

        <tr

            key={item.id}
            className="border-b border-gray-200 even:bg-teal-500/30 text-base hover:bg-green-700"
            >

            <td className="hidden lg:table-cell items-center">{item?.id}</td>
            <td className="py-2 xl:py-4 table-cell items-center">{item?.firstName} {item?.lastName}</td>
            <td className="table-cell capitalize">{item?.emailAddresses[0].emailAddress}</td>
            <td className="table-cell capitalize">{item?.publicMetadata.role}</td>
            <td className="table-cell capitalize">Active</td>
            <td className="table-cell capitalize">{format(item?.lastSignInAt, "yyyy-MM-dd h:mm:ss")}</td>

        </tr>
    );







    
  return (
    <div className="bg-black-800 rounded-xl p-2 md:p-4 2xl:p-6">

        <div className="flex items-center justify-between">

            <div className="hidden lg:flex items-center gap-1">

                <BriefcaseBusiness size={20} className="text-gray-500" />

                <p className="text-2xl font-semibold">{totalCount}</p>
                <span className="text-gray-600 text-sm xl:text-base">
                    Total Users
                </span>
            </div>
        </div>

        <div>
            <Table columns={columns} data={data} renderRow={renderRow}/>
        </div>

    </div>
  )
}

export default UserPage

*/}