// app/record/billing/patient/page.tsx
/* eslint-disable */
import { ViewAction } from '@/components/action-options';
import { Pagination } from '@/components/pagination';
import SearchInput from '@/components/search-input';
import { Table } from '@/components/tables/table';
import { cn } from '@/lib/utils';
import { SearchParamsProps } from '@/types';
import { getPatientPaymentRecords } from '@/utils/services/payments';
import { DATA_LIMIT } from '@/utils/setting';
import { Patient, Payment } from '@prisma/client';
import { format } from 'date-fns';
import { ReceiptText } from 'lucide-react';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import React from 'react';

const columns = [
  {
    header: "RNO",
    key: "id",
  },
  {
    header: "Bill Date",
    key: "bill_date",
    className: "hidden md:table-cell",
  },
  {
    header: "Total",
    key: "total",
    className: "hidden lg:table-cell",
  },
  {
    header: "Discount",
    key: "discount",
    className: "hidden lg:table-cell",
  },
  {
    header: "Payable",
    key: "payable",
    className: "hidden lg:table-cell",
  },
  {
    header: "Paid",
    key: "amount_paid",
    className: "hidden xl:table-cell",
  },
  {
    header: "Status",
    key: "status",
    className: "hidden lg:table-cell",
  },
  {
    header: "Actions",
    key: "action",
  },
];

interface ExtendedProps extends Payment {
  patient: Patient;
}

const PatientBillingPage = async (props: SearchParamsProps) => {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Get patient ID from clerk user
  const patientId = user.id;

  const searchParams = await props.searchParams;
  const page = searchParams?.p || "1" as string;
  const searchQuery = searchParams?.q || "" as string;

  const { data, totalPages, totalRecords, currentPage } = await getPatientPaymentRecords({
    page,
    search: searchQuery,
    patientId // Pass the patient ID to filter records
  });

  if (!data) return null;

  const renderRow = (item: ExtendedProps) => {
    const name = item?.patient?.first_name + " " + item?.patient?.last_name;
    const patient = item?.patient;
    
    return (
      <tr
        key={`${item?.id || 'unknown'}-${patient?.id || 'unknown'}`}
        className="border-b border-emerald-500/30 even:bg-emerald-900/30 text-emerald-50 hover:bg-emerald-800/40 transition-colors duration-200"
      >
        <td># {item?.id}</td>

        <td className="hidden md:table-cell text-emerald-200/90">
          {format(item?.bill_date, "yyyy-MM-dd")}
        </td>

        {/* Total */}
        <td className="hidden lg:table-cell text-emerald-200/90">
          ₱{item?.total_amount.toFixed(2)}
        </td>

        {/* Discount */}
        <td className="hidden lg:table-cell text-emerald-200/90">
          ₱{item?.discount.toFixed(2)}
        </td>

        {/* Payable */}
        <td className="hidden lg:table-cell text-emerald-200/90">
          ₱{(item?.total_amount - item?.discount).toFixed(2)}
        </td>

        {/* Paid */}
        <td className="hidden xl:table-cell text-emerald-200/90">
          ₱{(item?.amount_paid).toFixed(2)}
        </td>

        {/* Status */}
        <td className="hidden lg:table-cell text-emerald-200/90">
          <span className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            item?.status === "UNPAID" 
              ? "bg-red-900/30 text-red-400 border border-red-500/30" 
              : item?.status === "PAID" 
              ? "bg-emerald-900/30 text-emerald-400 border border-emerald-500/30" 
              : "bg-yellow-900/30 text-yellow-400 border border-yellow-500/30"
          )}>
            {item?.status}
          </span>
        </td>

        <td>
          <ViewAction 
            href={`/record/payments/${item?.appointment_id}?category=billing`} 
          />
        </td>
      </tr>
    );
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
          <ReceiptText size={20} className="text-emerald-400" />
          <p className="text-2xl font-semibold text-emerald-100">{totalRecords}</p>
          <span className="text-emerald-300 text-sm xl:text-base font-mono tracking-wide">
            My Billing Records
          </span>
        </div>
        <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
          <SearchInput />
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
        <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
        <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">
          My Billing History
        </h2>
        
        <Table columns={columns} data={data} renderRow={renderRow} />

        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          totalRecords={totalRecords}
          limit={DATA_LIMIT}
        />
      </div>
    </div>
  );
};

export default PatientBillingPage;