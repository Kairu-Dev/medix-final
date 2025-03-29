"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { generateBill } from "@/app/actions/medical";

import { z } from "zod";
import { CustomInput } from "../custom-input";
import { Button } from "../ui/button";
import { CardHeader } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Form } from "../ui/form";
import { PaymentSchema } from "@/lib/validation";

interface DataProps {
  id?: string | number;
  total_bill: number;
}
export const GenerateFinalBills = ({ id, total_bill }: DataProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  let discountInfo = null;

  const form = useForm<z.infer<typeof PaymentSchema>>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: {
      id: id?.toString(),
      bill_date: new Date(),
      discount: "0",
      total_amount: total_bill.toString(),
    },
  });

  const handleOnSubmit = async (values: z.infer<typeof PaymentSchema>) => {
    try {
      setIsLoading(true);

      const resp = await generateBill(values);

      if (resp.success) {
        toast.success("Patient bill generated successfully!");

        router.refresh();

        form.reset();
      } else if (resp.error) {
        toast.error(resp.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-sm font-normal bg-gray-900/60 border border-red-500/40 rounded-lg shadow-lg relative backdrop-blur-sm text-red-100 hover:bg-red-800/40 transition-colors duration-200 font-mono tracking-wide"
          >
            <Plus size={22} className="text-red-400 mr-1" />
            Generate Final Bill
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900/90 border border-red-500/40 rounded-xl shadow-lg backdrop-blur-sm">
          {/* Minecraft-style decorative elements */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-red-500/70 rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-red-500/70 rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-red-500/70 rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-red-500/70 rounded-br-xl"></div>
          
          {/* Enhanced red glow effects */}
          <div className="absolute -top-5 right-10 w-32 h-32 bg-red-300/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-5 left-20 w-32 h-32 bg-red-200/15 rounded-full blur-3xl"></div>

          <CardHeader className="px-0 relative z-10">
            <DialogTitle className="text-lg font-bold text-white tracking-wider pl-2 font-mono uppercase mb-4">
              <div className="absolute -left-4 h-6 w-1 bg-red-400 rounded-full shadow-[0_0_15px_rgba(248,113,113,0.8)]"></div>
              Patient Medical Bill
            </DialogTitle>
          </CardHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleOnSubmit)}
              className="space-y-8 bg-gradient-to-b from-red-50/15 to-red-900/30 rounded-xl p-4 border border-red-500/40 shadow-md backdrop-blur-sm relative"
            >
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-red-900/70 to-red-950/60 p-3 rounded-lg border border-red-500/30">
                  <span className="text-red-300 text-sm font-mono tracking-wide">Total Bill</span>
                  <p className="text-3xl font-semibold text-red-100">
                    {total_bill?.toFixed(2)}
                  </p>
                </div>
              </div>

              <CustomInput
                type="input"
                control={form.control}
                name="discount"
                placeholder="eg.: 5"
                label="Discount (%)"
              />

              <CustomInput
                type="input"
                control={form.control}
                name="bill_date"
                label="Bill Date"
                placeholder=""
                inputType="date"
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white font-mono tracking-wide border border-red-500/50 shadow-lg shadow-red-900/30"
              >
                Generate Bill
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};