"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { infer, z } from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Form } from "../ui/form";
import { CustomInput, SwitchInput } from "../custom-input";

import { Label } from "../ui/label";
import { toast } from "sonner";
import { DoctorSchema, StaffSchema } from "@/lib/validation";
import { createNewDoctor, createNewStaff } from "@/app/actions/admin-action";
import { SPECIALIZATION } from "@/utils/setting";


const TYPES = [
  { label: "Nurse", value: "NURSE" },
  { label: "Laboratory", value: "LAB_TECHNICIAN" },
  { label: "Physical Therapist", value: "PHYSICAL_THERAPIST" },

];


export const StaffForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  

  const form = useForm<z.infer<typeof StaffSchema>>({
    resolver: zodResolver(StaffSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "NURSE",
      address: "",
      department: "",
      img: "",
      password: "",
      license_number: "",
    },
  });

  

  const handleSubmit = async (values: z.infer<typeof StaffSchema>) => {
    try {
     

      setIsLoading(true);
      const resp = await createNewStaff(values);

      if (resp.success) {
        toast.success("Staff added successfully!");

        
        form.reset();
        router.refresh();
      } else if (resp.error) {
        toast.error(resp.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="bg-gradient-to-br from-emerald-700 to-emerald-900 border border-emerald-500/40 hover:bg-emerald-800 hover:border-emerald-400/60 shadow-lg shadow-emerald-900/20 transition-all duration-200 text-emerald-100 font-medium tracking-wide px-4">
          <Plus size={20} className="mr-2 text-emerald-300" />
          New Staff
        </Button>
      </SheetTrigger>

      <SheetContent className=" bg-gray-900/95 border-l border-emerald-500/50 rounded-xl rounded-r-xl md:h-[90%] md:top-[5%] md:right-[1%] overflow-y-scroll shadow-lg shadow-emerald-500/10 backdrop-blur-md remove-scrollbar xl:w-[650px] xl:max-w-none sm:w-[400px] sm:max-w-[540px]">
      {/* Glow effects */}
        <div className="absolute -top-10 right-20 w-40 h-40 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/3 left-10 w-32 h-32 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none"></div>
        
        {/* Decorative element */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl pointer-events-none"></div>
        
        <SheetHeader className="relative">
          <div className="absolute -left-4 top-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
          <SheetTitle className="text-xl font-mono uppercase tracking-wider text-emerald-100 pl-2">Add New Staff</SheetTitle>
        </SheetHeader>

        <div className="relative z-10">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-8 mt-5 2xl:mt-10"
            >
              <div className="bg-emerald-900/20 p-4 rounded-lg border border-emerald-500/30">
                <CustomInput
                  type="radio"
                  selectList={TYPES}
                  control={form.control}
                  name="role"
                  label="Type"
                  placeholder=""
                  defaultValue="NURSE"
                />
              </div>

              <div className="bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 p-4 rounded-lg border border-emerald-500/30 shadow-sm">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="name"
                  placeholder="Staff's name"
                  label="Full Name"
                />
              </div>

              <div className="flex items-start gap-2 flex-col md:flex-row">
                <div className="w-full md:w-1/2 bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 p-4 rounded-lg border border-emerald-500/30 shadow-sm">
                  <CustomInput
                    type="input"
                    control={form.control}
                    name="email"
                    placeholder="john@example.com"
                    label="Email Address"
                  />
                </div>
                <div className="w-full md:w-1/2 bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 p-4 rounded-lg border border-emerald-500/30 shadow-sm">
                  <CustomInput
                    type="input"
                    control={form.control}
                    name="phone"
                    placeholder="9225600735"
                    label="Contact Number"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 p-4 rounded-lg border border-emerald-500/30 shadow-sm">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="license_number"
                  placeholder="License Number"
                  label="License Number"
                />
              </div>

              <div className="bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 p-4 rounded-lg border border-emerald-500/30 shadow-sm">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="department"
                  placeholder="Cardiology"
                  label="Department"
                />
              </div>
              


              <div className="bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 p-4 rounded-lg border border-emerald-500/30 shadow-sm">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="address"
                  placeholder="1479 Street, Apt 1839-G, NY"
                  label="Address"
                />
              </div>

              <div className="bg-gradient-to-b from-emerald-50/10 to-emerald-900/20 p-4 rounded-lg border border-emerald-500/30 shadow-sm">
                <CustomInput
                  type="input"
                  control={form.control}
                  name="password"
                  placeholder=""
                  label="Password"
                  inputType="password"
                />
              </div>



              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 border border-emerald-500/40 shadow-lg shadow-emerald-900/20 text-emerald-100 font-medium tracking-wide py-6 relative"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400/30 rounded-t-md"></div>
                {isLoading ? "Processing..." : "Submit"}
              </Button>
            </form>
          </Form>
        </div>
      </SheetContent>
    </Sheet>
  );
};
