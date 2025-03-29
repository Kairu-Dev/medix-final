import { ActionDialog } from '@/components/action-dialog-admin';
import { ViewAction } from '@/components/action-options';
import { Pagination } from '@/components/pagination';
import { ProfileImage } from '@/components/profile-image';
import SearchInput from '@/components/search-input';
import { Table } from '@/components/tables/table';
import { cn } from '@/lib/utils';
import { SearchParamsProps } from '@/types';
import { checkRole } from '@/utils/roles';
import { getPaymentRecords } from '@/utils/services/payments';
import { DATA_LIMIT } from '@/utils/setting';
import { Patient, Payment} from '@prisma/client';
import { format } from 'date-fns';
import { ReceiptText} from 'lucide-react';
import React from 'react'


const columns = [
    {
      header: "RNO",
      key: "id",
    },
    {
      header: "Patient",
      key: "info",
      className: "",
    },
    {
      header: "Contact",
      key: "phone",
      className: "hidden md:table-cell",
    },
    {
      header: "Bill Date",
      key: "bill_date",
      className: "hidden md:table-cell",
    },
    {
      header: "Total",
      key: "total",
      className: "hidden xl:table-cell",
    },
    {
      header: "Discount",
      key: "discount",
      className: "hidden xl:table-cell",
    },
    {
      header: "Payable",
      key: "payable",
      className: "hidden xl:table-cell",
    },
    {
      header: "Paid",
      key: "amount_paid",
      className: "hidden xl:table-cell",
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
  


  interface ExtendedProps extends Payment {
    patient: Patient;
  }
  
  const BillingPage = async(props: SearchParamsProps) => {

    const searchParams = await props.searchParams;
    const page = searchParams?.p || "1" as string;
    const searchQuery = searchParams?.q || "" as string;

    const {data, totalPages, totalRecords, currentPage} = await getPaymentRecords({
        page,
        search: searchQuery
    });

    const isAdmin = await checkRole("ADMIN");

    if (!data) return null;

    const renderRow = (item: ExtendedProps) => {
        /* eslint-disable */
       
        const name = item?.patient?.first_name + " " + item?.patient?.last_name;
        const patient = item?.patient;
       return (
    <tr
    key={item?.id + patient?.id}
    className="border-b border-emerald-500/30 even:bg-emerald-900/30 text-emerald-50 hover:bg-emerald-800/40 transition-colors duration-200"
    >
        <td># {item?.id}</td>
        <td className="flex items-center gap-4 p-4">
            <ProfileImage 
            url={item?.patient?.img!}
            name={name}
            bgColor={patient?.colorCode!}
            textClassName="text-black"
            />

            <div>
                <h3 className="uppercase font-mono tracking-wider text-emerald-200">{name}</h3>
                <span className="text-sm capitalize text-emerald-300/80">{patient?.gender}</span>
            </div>
        </td>

        <td className="hidden md:table-cell text-emerald-300">{patient?.phone}</td>

        <td className="hidden md:table-cell text-emerald-200/90">{
            format(item?.bill_date, "yyyy-MM-dd")
        }</td>
        
        
        
        <td className="hidden xl:table-cell text-emerald-200/90">

        {
            item?.total_amount.toFixed(2)
        }

        </td>

        <td className="hidden xl:table-cell text-emerald-200/90">

        {(item?.total_amount - item?.discount).toFixed(2)}

        </td>

        <td className="hidden xl:table-cell text-emerald-200/90">

        {(item?.amount_paid).toFixed(2)}

        </td>

        <td className="hidden xl:table-cell text-emerald-200/90">

        <span className={cn(
            item?.status === "UNPAID" 
            ? "text-red-600" 
            : item?.status === "PAID" 
            ? "text-emerald-600" 
            : "text-gray-600"
        )}>

            {item?.status}
            
        </span>

        </td>
        
        <td>
            
                <ViewAction href={`/appointments/${item?.appointment_id}?category=bills`} 
                
                />

                {
                    isAdmin && <ActionDialog 
                    type="delete"
                    deleteType="payment"
                    id={item?.id.toString()}

                    
                    />
                }

          
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
                    <ReceiptText  size={20} className="text-emerald-400" />
                    <p className="text-2xl font-semibold text-emerald-100">{totalRecords}</p>
                    <span className="text-emerald-300 text-sm xl:text-base font-mono tracking-wide">
                        Total Records
                    </span>
                </div>
                <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
                    <SearchInput />
                </div>
            </div>

            <div className="mt-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
                <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
                <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">Billing Records Log</h2>
                
                <Table columns={columns} data={data} renderRow={renderRow} />

                
                    <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    totalRecords={totalRecords}
                    limit={DATA_LIMIT}
                    />
                
            </div>
        </div>
    )
}

export default BillingPage
