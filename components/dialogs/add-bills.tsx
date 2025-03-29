"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, CreditCard, Calculator, Calendar } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Services } from "@prisma/client";

// Import your components and utilities
import { Form } from "../ui/form";
import { CustomInput } from "../custom-input";
import { addNewBill } from "@/app/actions/medical";
import { PatientBillSchema } from "@/lib/validation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { CardDescription, CardHeader } from "../ui/card";
import { Separator } from "../ui/separator";

interface DataProps {
  id?: string | number;
  appId?: string | number;
  servicesData: Services[];
}

export const AddBills = ({ id, appId, servicesData }: DataProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [data, setData] = useState<any>();

  const form = useForm<z.infer<typeof PatientBillSchema>>({
    resolver: zodResolver(PatientBillSchema),
    defaultValues: {
      bill_id: String(id),
      service_id: undefined,
      service_date: new Date().toDateString(),
      appointment_id: String(appId),
      quantity: undefined,
      unit_cost: undefined,
      total_cost: undefined,
    },
  });

  const handleOnSubmit = async (values: z.infer<typeof PatientBillSchema>) => {
    try {
      setIsLoading(true);
      const resp = await addNewBill(values);

      if (resp.success) {
        toast.success("Patient bill added successfully!");
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

  useEffect(() => {
    if (servicesData) {
      setData(
        servicesData?.map((service) => ({
          value: service.id.toString(),
          label: service.service_name,
        }))
      );
    }
  }, [servicesData, id]);

  const selectedService = form.watch("service_id");
  const quantity = form.watch("quantity");

  useEffect(() => {
    if (selectedService) {
      const unit_cost = servicesData.find(
        (el) => el.id === Number(selectedService)
      );

      if (unit_cost) {
        form.setValue("unit_cost", unit_cost?.price.toFixed(2));
      }
      if (quantity) {
        form.setValue(
          "total_cost",
          (Number(quantity) * unit_cost?.price!).toFixed(2)
        );
      }
    }
  }, [selectedService, quantity, form, servicesData]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="bg-gray-900/80 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-900/30 hover:text-emerald-300 transition-all duration-300 px-4 rounded-md shadow-lg backdrop-blur-sm font-mono text-sm tracking-wide"
        >
          <Plus size={18} className="mr-2 text-emerald-500" />
          ADD BILL
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900/95 border border-emerald-500/40 shadow-lg backdrop-blur-xl max-w-md overflow-hidden">
        {/* Ambient glow effects */}
        <div className="absolute -top-10 right-10 w-36 h-36 bg-emerald-300/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-5 left-10 w-32 h-32 bg-emerald-200/10 rounded-full blur-2xl"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/50 rounded-br-xl"></div>
        
        <CardHeader className="px-0 relative z-10">
          <div className="flex items-center mb-1">
            <div className="h-6 w-1 bg-emerald-500 mr-2 rounded-full"></div>
            <DialogTitle className="text-emerald-200 font-mono tracking-wide text-xl">ADD PATIENT BILL</DialogTitle>
          </div>
          <CardDescription className="text-emerald-300/70 ml-3 font-light">
            Ensure accurate readings are performed as this may affect the
            diagnosis and other medical processes.
          </CardDescription>
        </CardHeader>

        <Separator className="bg-emerald-500/30 my-2" />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleOnSubmit)}
            className="space-y-6 relative z-10"
          >
            <div className="bg-gray-800/60 p-4 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
              <h3 className="text-emerald-400 font-mono text-sm mb-3 flex items-center">
                <CreditCard size={16} className="mr-2" />
                SERVICE DETAILS
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <CustomInput
                    type="select"
                    control={form.control}
                    name="service_id"
                    placeholder="Select service"
                    label="Service Name"
                    selectList={data!}
                  />
                </div>
                <div className="col-span-1">
                  <CustomInput
                    type="input"
                    control={form.control}
                    name="unit_cost"
                    placeholder=""
                    label="Unit Cost"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/60 p-4 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
              <h3 className="text-emerald-400 font-mono text-sm mb-3 flex items-center">
                <Calculator size={16} className="mr-2" />
                QUANTITY & COST
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                  <CustomInput
                    type="input"
                    control={form.control}
                    name="quantity"
                    placeholder="Enter quantity"
                    label="Quantity"
                  />
                </div>
                <div className="col-span-1">
                  <CustomInput
                    type="input"
                    control={form.control}
                    name="total_cost"
                    placeholder="0.00"
                    label="Total Cost"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/60 p-4 rounded-lg border border-emerald-500/20 backdrop-blur-sm">
              <h3 className="text-emerald-400 font-mono text-sm mb-3 flex items-center">
                <Calendar size={16} className="mr-2" />
                DATE INFO
              </h3>
              <CustomInput
                type="input"
                control={form.control}
                name="service_date"
                label="Service Date"
                placeholder=""
                inputType="date"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white transition-all duration-300 border border-emerald-500/50 font-mono tracking-wide shadow-lg" 
            >
              {isLoading ? (
                <span className="flex items-center">
                  PROCESSING...
                </span>
              ) : (
                <span className="flex items-center">
                  SUBMIT BILL
                </span>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};