import db from "@/lib/db";
import { calculateDiscount } from "@/utils";
import { checkRole } from "@/utils/roles";
import { ReceiptText } from "lucide-react";
import { Table } from "../tables/table";
import { PatientBills } from "@prisma/client";
import { format } from "date-fns";

import { Separator } from "../ui/separator";
import ActionDialog from "../action-dialog-admin";
import { AddBills } from "../dialogs/add-bills";
import { GenerateFinalBills } from "./generate-final-bills";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
 /* eslint-disable */

// Add currency symbol and formatter for Philippine Pesos
const CURRENCY_SYMBOL = "₱";
const formatCurrency = (amount: number) => {
  return `${CURRENCY_SYMBOL}${amount.toFixed(2)}`;
};

const columns = [
  {
    header: "No",
    key: "no",
    className: "hidden md:table-cell",
  },
  {
    header: "Service",
    key: "service",
  },
  {
    header: "Date",
    key: "date",
    className: "",
  },
  {
    header: "Quantity",
    key: "qty",
    className: "hidden md:table-cell",
  },
  {
    header: "Unit Price",
    key: "price",
    className: "hidden md:table-cell",
  },
  {
    header: "Total Cost",
    key: "total",
    className: "",
  },
  {
    header: "Action",
    key: "action",
    className: "hidden xl:table-cell",
  },
];

interface ExtendedBillProps extends PatientBills {
  service: {
    service_name: string;
    id: number;
  };
}
export const BillsContainer = async ({ id }: { id: string }) => {
  // Store role check result in variables to ensure consistency
  const isAdmin = await checkRole("ADMIN");
  const isDoctor = await checkRole("DOCTOR");
  const isAdminOrDoctor = isAdmin || isDoctor;
  
  const [data, servicesData] = await Promise.all([
    db.payment.findFirst({
      where: { appointment_id: Number(id) },
      include: {
        bills: {
          include: {
            service: { select: { service_name: true, id: true } },
          },

          orderBy: { created_at: "asc" },
        },
      },
    }),
    db.services.findMany(),
  ]);

  let totalBills = 0;

  // Ensure billData is always an array
  const billData = data?.bills || [];
  
  const discount = data
    ? calculateDiscount({
        amount: data.total_amount || 0,
        discount: data.discount || 0,
      })
    : { finalAmount: 0, discountPercentage: 0 };

  if (billData && billData.length > 0) {
    totalBills = billData.reduce((sum, acc) => sum + acc.total_cost, 0);
  }

  // Pre-calculate values to avoid calculations in JSX
  const totalAmount = data?.total_amount || totalBills || 0;
  const discountAmount = data?.discount || 0;
  const discountPercentage = discount?.discountPercentage || 0;
  const finalAmount = discount?.finalAmount || 0;
  const amountPaid = data?.amount_paid || 0;
  const unpaidAmount = finalAmount - amountPaid;

  const renderRow = (item: ExtendedBillProps) => {
    // Safely format the date
    const formattedDate = item?.service_date 
      ? format(new Date(item.service_date), "MMM d, yyyy") 
      : "N/A";
      
    return (
      <tr
        key={item.id}
        className="border-b border-emerald-200/20 even:bg-gray-900/40 text-sm hover:bg-emerald-900/20 transition-colors duration-200"
      >
        <td className="hidden md:table-cell py-2 xl:py-6 text-emerald-200/80 font-mono"># {item?.id}</td>

        <td className="items-center py-2 text-white">{item?.service?.service_name || "Unknown Service"}</td>

        <td className="text-emerald-300/80 font-mono">{formattedDate}</td>

        <td className="hidden items-center py-2 md:table-cell text-emerald-200/80">
          {item?.quantity || 0}
        </td>
        <td className="hidden lg:table-cell text-emerald-200/80">{formatCurrency(item?.unit_cost || 0)}</td>
        <td className="font-medium text-white">{formatCurrency(item?.total_cost || 0)}</td>

        <td className="hidden xl:table-cell">
          
          <ActionDialog
            type="delete"
            id={item?.id?.toString() || ""}
            deleteType="bill"
          />
          
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-gray-900/60 border border-emerald-500/40 rounded-xl p-2 2xl:p-4 shadow-lg backdrop-blur-sm relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute -top-5 right-10 w-36 h-36 bg-emerald-300/15 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-5 left-10 w-32 h-32 bg-emerald-200/10 rounded-full blur-2xl"></div>
      
      {/* Minecraft-style decorative elements */}
      <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
      <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
      
      <div className="w-full flex flex-col md:flex-row md:items-center justify-between mb-6 relative z-10">
        <div className="">
          <h1 className="font-mono uppercase tracking-wider text-xl text-emerald-200">Patient Bills</h1>
          <div className="hidden lg:flex items-center gap-1">
            <ReceiptText size={20} className="text-emerald-500" />
            <p className="text-2xl font-semibold text-emerald-200">{billData?.length || 0}</p>
            <span className="text-emerald-300/80 text-sm xl:text-base font-mono">
              total records
            </span>
          </div>
        </div>

        {isAdmin && (
          <div className="flex gap-5 items-center mt-5 justify-end">
            <AddBills id={data?.id} appId={id} servicesData={servicesData} />
            <GenerateFinalBills id={data?.id} total_bill={totalBills} />
          </div>
        )}
      </div>

      <div className="relative z-10 bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 rounded-xl border border-emerald-500/30 shadow-md backdrop-blur-sm">
        <Table columns={columns} renderRow={renderRow} data={billData} />
      </div>

      <Separator className="my-4 bg-emerald-500/30" />

      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between md:text-center py-2 space-y-6 relative z-10">
        <div className="w-[120px] bg-gray-900/40 p-3 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
          <span className="text-emerald-300/80 font-mono text-sm tracking-wide">Total Bill</span>
          <p className="text-xl font-semibold text-white">
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <div className="w-[120px] bg-gray-900/40 p-3 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
          <span className="text-emerald-300/80 font-mono text-sm tracking-wide">Discount</span>
          <p className="text-xl font-semibold text-yellow-400">
            {formatCurrency(discountAmount)}{" "}
            <span className="text-sm text-emerald-300/60">
              {" "}
              ({discountPercentage.toFixed(2)}%)
            </span>
          </p>
        </div>
        <div className="w-[120px] bg-gray-900/40 p-3 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
          <span className="text-emerald-300/80 font-mono text-sm tracking-wide">Payable</span>
          <p className="text-xl font-semibold text-white">
            {formatCurrency(finalAmount)}
          </p>
        </div>
        <VisuallyHidden>
        <div className="w-[120px] bg-gray-900/40 p-3 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
          <span className="text-emerald-300/80 font-mono text-sm tracking-wide">Amount Paid</span>
          <p className="text-xl font-semibold text-emerald-400">
            {formatCurrency(amountPaid)}
          </p>
        </div>
        </VisuallyHidden>
        <div className="w-[120px] bg-gray-900/40 p-3 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
          <span className="text-emerald-300/80 font-mono text-sm tracking-wide">Unpaid Amount</span>
          <p className="text-xl font-semibold text-red-400">
            {formatCurrency(unpaidAmount)}
          </p>
        </div>
      </div>
    </div>
  );
};