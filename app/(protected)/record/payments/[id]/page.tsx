// app/record/appointments/[id]/page.tsx
// or app/billing/page.tsx (depending on your actual file path)
// New Version
  /* eslint-disable */
import ClientPaymentButton from '@/components/billing-actions';
import { ProfileImage } from '@/components/profile-image';
import { getPaymentByAppointmentId, getPaymentById } from '@/utils/services/payment-fetch';
import { Patient, Payment, PaymentMethod, PaymentStatus } from '@prisma/client';
import { format } from 'date-fns';
import { ArrowLeft, CreditCard, DollarSign, PercentIcon, Receipt, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React from 'react';

interface PaymentDetailsProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    cat?: string;
  }>;
}

interface BillItem {
  id: number;
  bill_id: number;
  service_id: number;
  service_date: Date;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  service: {
    id: number;
    service_name: string;  
    description: string;
    price: number;        
    created_at: Date;
    updated_at: Date;
  };
}

interface ExtendedPayment extends Payment {
  bills: BillItem[];
  patient: Patient;
}

// Function to get status color
const getStatusColor = (status: PaymentStatus) => {
  switch (status) {
    case "PAID":
      return "text-emerald-500 bg-emerald-500/20 border-emerald-500/40";
    case "UNPAID":
      return "text-red-500 bg-red-500/20 border-red-500/40";
    case "PART":
      return "text-amber-500 bg-amber-500/20 border-amber-500/40";
    default:
      return "text-gray-500 bg-gray-500/20 border-gray-500/40";
  }
};

// Function to get payment method icon
const getPaymentMethodIcon = (method: PaymentMethod) => {
  switch (method) {
    case "CASH":
      return <DollarSign className="h-5 w-5" />;
    case "CARD":
      return <CreditCard className="h-5 w-5" />;
    default:
      return <Receipt className="h-5 w-5" />;
  }
};

/**
 * Renders the payment details page for a given payment or appointment identifier.
 *
 * @param props - Object containing route params and query params as promises.
 * @param props.params - Promise resolving to an object with the required `id` route parameter; if `id` is missing the page renders a 404.
 * @param props.searchParams - Promise resolving to an object with optional `cat` query parameter (defaults to "billing").
 * @returns A React element that displays patient info, receipt details, billing summary, bill items, and payment actions for the resolved payment; renders a 404 page if the payment cannot be found.
 */
export default async function PaymentDetailsPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ cat?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { id } = params;
  const category = searchParams?.cat || 'billing';

  if (!id) {
    notFound();
  }
  
  let response;
  
  // First try to find payment directly by ID
  response = await getPaymentById(id);
  
  // If not found, try to find by appointment ID
  if (!response.success || !response.data) {
    response = await getPaymentByAppointmentId(id);
  }
  
  // If still not found, show 404
  if (!response.success || !response.data) {
    notFound();
  }

  const payment = response.data as ExtendedPayment;
  const payable = payment.total_amount - payment.discount;
  const balance = payable - payment.amount_paid;
  const patient = payment.patient;
  const fullName = `${patient.first_name} ${patient.last_name}`;
  
  // Determine payment status dynamically based on the amounts
  const paymentStatus = payment.status;

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
      
      {/* Back button */}
      <Link 
        href={`/record/appointments/${payment.appointment_id}?cat=bills`}
        className="inline-flex items-center gap-2 bg-emerald-900/70 hover:bg-emerald-800/70 text-emerald-100 px-4 py-2 rounded-lg border border-emerald-500/30 transition-colors duration-200 mb-6"
      >
        <ArrowLeft size={16} />
        <span>Back to Billing</span>
      </Link>
      
      <div className="mt-4 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-6 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
        <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          {/* Left column - Patient info */}
          <div className="w-full md:w-1/3">
            <h2 className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">Payment Details</h2>
            
            <div className="bg-gray-900/70 border border-emerald-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <ProfileImage 
                  url={patient.img || ""}
                  name={fullName}
                  bgColor={patient.colorCode || "#10b981"}
                  textClassName="text-black"
                />
                
                <div>
                  <h3 className="uppercase font-mono tracking-wider text-emerald-200">{fullName}</h3>
                  <span className="text-sm capitalize text-emerald-300/80">{patient.gender}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2 text-emerald-200">
                  <User size={16} className="text-emerald-400" />
                  <span className="text-sm">ID: {patient.id}</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-200">
                  <Receipt size={16} className="text-emerald-400" />
                  <span className="text-sm">Contact: {patient.phone}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right column - Payment info */}
          <div className="w-full md:w-2/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-md font-bold text-emerald-200 tracking-wider font-mono">Receipt #{payment.receipt_number}</h3>
              <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(paymentStatus)}`}>
                {paymentStatus}
              </span>
            </div>
            
            <div className="bg-gray-900/70 border border-emerald-500/30 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-emerald-400 text-sm">Bill Date</p>
                  <p className="text-white">{format(payment.bill_date, "MMMM dd, yyyy")}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-emerald-400 text-sm">Payment Date</p>
                  <p className="text-white">{format(payment.payment_date, "MMMM dd, yyyy")}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-emerald-400 text-sm">Appointment ID</p>
                  <p className="text-white">#{payment.appointment_id}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-emerald-400 text-sm">Payment Method</p>
                  <div className="flex items-center gap-2 text-white">
                    {getPaymentMethodIcon(payment.payment_method)}
                    <span>{payment.payment_method}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment details */}
            <div className="bg-gray-900/70 border border-emerald-500/30 rounded-xl p-4">
              <h3 className="text-md font-bold text-emerald-200 tracking-wider font-mono mb-4">Billing Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-emerald-500/20">
                  <span className="text-emerald-200">Total Amount</span>
                  <span className="text-white font-medium">{payment.total_amount}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-emerald-500/20">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-200">Discount</span>
                    {payment.discount > 0 && (
                      <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <PercentIcon size={10} />
                        {((payment.discount / payment.total_amount) * 100).toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <span className="text-emerald-300">{payment.discount}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-emerald-500/20">
                  <span className="text-emerald-200">Payable Amount</span>
                  <span className="text-white font-medium">{payable}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-emerald-500/20">
                  <span className="text-emerald-200">Amount Paid</span>
                  <span className="text-emerald-400 font-medium">{payment.amount_paid}</span>
                </div>
                
                {paymentStatus !== "PAID" && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-red-400 font-medium">Balance Due</span>
                    <span className="text-red-400 font-medium">{balance}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Button Integration */}
            {paymentStatus !== "PAID" && (
              <ClientPaymentButton payment={payment} />
            )}
          </div>
        </div>
        
        {/* Bill items section */}
        {payment.bills && payment.bills.length > 0 && (
          <div className="mt-6 bg-gray-900/70 border border-emerald-500/30 rounded-xl p-4">
            <h3 className="text-md font-bold text-emerald-200 tracking-wider font-mono mb-4">Bill Items</h3>
            
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-emerald-500/30">
                  <th className="pb-2 text-emerald-400 font-normal">Item</th>
                  <th className="pb-2 text-emerald-400 font-normal">Quantity</th>
                  <th className="pb-2 text-emerald-400 font-normal text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payment.bills.map((bill) => (
                  <tr key={bill.id} className="border-b border-emerald-500/20">
                    <td className="py-2 text-emerald-200">{bill.service?.service_name || "Unknown Service"}</td>
                    <td className="py-2 text-emerald-200">{bill.quantity}</td>
                    <td className="py-2 text-emerald-200 text-right">{bill.total_cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}