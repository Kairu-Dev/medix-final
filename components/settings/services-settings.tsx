import { getServices } from "@/utils/services/admin";
import { Services } from "@prisma/client";
import { DatabaseIcon } from "lucide-react";

import { Table } from "../tables/table";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AddService } from "../dialogs/add-services";
import { checkRole } from "@/utils/roles";
import ActionDialog from "../action-dialog-admin";

const columns = [
  {
    header: "ID",
    key: "id",
    className: "hidden md:table-cell",
  },
  {
    header: "Service Name",
    key: "name",
    className: "hidden md:table-cell",
  },
  {
    header: "Price",
    key: "price",
    className: "hidden md:table-cell",
  },
  {
    header: "Description",
    key: "description",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    key: "action",
  },
];

export const ServiceSettings = async () => {
  const { data } = await getServices();
   const isAdmin = await checkRole("ADMIN");
 

  const renderRow = (item: Services) => (
    <tr
      key={item.id}
      className="border-b border-emerald-200/20 even:bg-gray-900/40 text-sm hover:bg-emerald-900/20 transition-colors duration-200"
    >
      <td className="flex items-center gap-2 md:gap-4 py-4 text-emerald-200/80 font-mono"># {item?.id}</td>

      <td className="hidden md:table-cell text-white">{item.service_name}</td>
      <td className="hidden md:table-cell capitalize text-emerald-300/80 font-mono">
        {item?.price?.toFixed(2)}
      </td>

      <td className="hidden xl:table-cell w-[50%] text-emerald-200/80">
        <p className="line-clamp-1">{item.description!}</p>
      </td>
      <td>
        
        <div className="flex items-center gap-2">
          {/*
              <Link href={`/list/teachers/${item?.id}`}>
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-lamaSky">
                  View
                </button>
              </Link> */}
    
              {
                                 isAdmin && <ActionDialog 
                                 type="delete"
                                 id={item.id.toString()}
                                 deleteType="auditLog"
                                 />
                             }
             
            </div>
      </td>
    </tr>
  );

  return (
    <>
      <div className="bg-gray-900/60 border border-emerald-500/40 rounded-xl shadow-lg backdrop-blur-sm relative">
        {/* Ambient glow effects */}
        <div className="absolute -top-5 right-10 w-36 h-36 bg-emerald-300/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-5 left-10 w-32 h-32 bg-emerald-200/10 rounded-full blur-2xl"></div>
        
        {/* Minecraft-style decorative elements */}
        <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
        
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <DatabaseIcon size={20} className="text-emerald-500" />
              <CardTitle className="capitalize font-mono tracking-wider text-xl text-emerald-200">Services</CardTitle>
            </div>
            <CardDescription className="text-emerald-300/80 font-mono text-sm">
              Perform all settings and other parameters of the system from this
              section.
            </CardDescription>
            <div className="hidden lg:flex items-center gap-1 mt-1">
              <p className="text-2xl font-semibold text-emerald-200">{data?.length}</p>
              <span className="text-emerald-300/80 text-sm xl:text-base font-mono">
                total services
              </span>
            </div>
          </div>
          <AddService />
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 rounded-xl border border-emerald-500/30 shadow-md backdrop-blur-sm">
            <Table columns={columns} renderRow={renderRow} data={data!} />
          </div>
        </CardContent>
      </div>
    </>
  );
};