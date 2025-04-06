import db from "@/lib/db";
import { Table } from "../tables/table";
import { Payment } from "@prisma/client";
import { format } from "date-fns";
import { ViewAction } from "../action-options";
import { checkRole } from "@/utils/roles";
import ActionDialog from "../action-dialog-admin";
import { PhilippinePeso } from "lucide-react";

const columns = [
  {
    header: "No",
    key: "id",
  },
  {
    header: "Bill Date",
    key: "bill_date",
    className: "",
  },
  {
    header: "Payment Date",
    key: "pay_date",
    className: "hidden md:table-cell",
  },
  {
    header: "Total",
    key: "total",
    className: "",
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
    key: "paid",
    className: "hidden xl:table-cell",
  },
  {
    header: "Actions",
    key: "action",
  },
];

export const PaymentsContainer = async ({
  patientId,
}: {
  patientId: string;
}) => {
  const data = await db.payment.findMany({
    where: { patient_id: patientId },
  });

  if (!data) return null;
  const isAdmin = await checkRole("ADMIN");

  const renderRow = (item: Payment) => {
    return (
      <tr
        key={item.id}
        className="border-b border-emerald-500/30 even:bg-emerald-900/30 text-emerald-50 hover:bg-emerald-800/40 transition-colors duration-200"
      >
        <td className="flex items-center gap-2 md:gap-4 py-2 xl:py-4 text-emerald-200 font-mono">
          #{item?.id}
        </td>

        <td className="text-emerald-300/90 font-mono">{format(item?.bill_date, "MMM d, yyyy")}</td>
        <td className="hidden items-center py-2 md:table-cell text-emerald-300/90 font-mono">
          {format(item?.payment_date, "MMM d, yyyy")}
        </td>
        <td className="text-emerald-200 font-semibold">${item?.total_amount.toFixed(2)}</td>
        <td className="hidden xl:table-cell text-emerald-200/80">${item?.discount.toFixed(2)}</td>
        <td className="hidden xl:table-cell text-emerald-100 font-semibold">
          ${(item?.total_amount - item?.discount).toFixed(2)}
        </td>
        <td className="hidden xl:table-cell text-emerald-200">${item?.amount_paid.toFixed(2)}</td>

        <td className="">
          <div className="flex items-center">
            <ViewAction
              href={`/record/appointments/${item?.appointment_id}?cat=bills`}
            />
            {isAdmin && (
              <ActionDialog
                type="delete"
                deleteType="payment"
                id={item?.id.toString()}
              />
            )}
          </div>
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
          <PhilippinePeso size={20} className="text-emerald-400" />
          <p className="text-2xl font-semibold text-emerald-100">{data?.length ?? 0}</p>
          <span className="text-emerald-300 text-sm xl:text-base font-mono tracking-wide">
            total payments
          </span>
        </div>
      </div>

      <div className="mt-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-4 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
        <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
        <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">Payment Records</h2>
        
        <Table columns={columns} renderRow={renderRow} data={data} />
      </div>
    </div>
  );
};