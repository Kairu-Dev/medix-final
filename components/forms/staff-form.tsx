"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { Plus, User, Mail, Phone, MapPin, Building2, Shield, Eye, EyeOff, Stethoscope } from "lucide-react";
import { Form } from "../ui/form";
import { CustomInput } from "../custom-input";

import { toast } from "sonner";
import { StaffSchema } from "@/lib/validation";
import { createNewStaff } from "@/app/actions/admin-action";


const TYPES = [
  { label: "Nurse", value: "NURSE" },
  { label: "Laboratory", value: "LAB_TECHNICIAN", comingSoon: true },
  { label: "Physical Therapist", value: "PHYSICAL_THERAPIS", comingSoon: true },
];

const DEFAULT_DEPARTMENTS = [
  { label: "Cardiology", value: "cardiology" },
  { label: "Pulmonology", value: "pulmonology" },
  { label: "Orthopedics", value: "orthopedics" },
  { label: "Pediatrics", value: "pediatrics" },
  { label: "Radiology", value: "radiology" },
  { label: "Oncology", value: "oncology" },
  { label: "Dermatology", value: "dermatology" },
  { label: "General Surgery", value: "general_surgery" },
  { label: "Emergency", value: "emergency" },
  { label: "Urgent Care", value: "urgent_care" },
  { label: "Neurology", value: "neurology" },
  { label: "Gastroenterology", value: "gastroenterology" },
  { label: "ENT", value: "ent" },
  { label: "Endocrinology", value: "endocrinology" },
  { label: "General Practice", value: "general_practice" },
  { label: "Psychiatry", value: "psychiatry" },
  { label: "Ophthalmology", value: "ophthalmology" },
  { label: "Urology", value: "urology" },
  { label: "Gynecology", value: "gynecology" },
];


export const StaffForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
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
        setOpen(false); // Close dialog on success
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

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when dialog closes
      form.reset();
      setShowPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700 border border-emerald-400/30 shadow-lg shadow-emerald-500/25 transition-all duration-300 text-white font-semibold tracking-wide px-6 py-2.5 rounded-lg group">
          <Plus size={18} className="mr-2 text-emerald-200 group-hover:text-white transition-colors" />
          Add New Staff
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 gap-0 bg-slate-900 border-2 border-emerald-500/30 shadow-2xl overflow-hidden">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 p-6 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-8 w-20 h-20 border-2 border-white/20 rounded-full"></div>
            <div className="absolute bottom-4 left-8 w-16 h-16 border-2 border-white/15 rounded-full"></div>
            <div className="absolute top-1/2 right-1/4 w-12 h-12 border border-white/10 rounded-full"></div>
          </div>
          
          <DialogHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-full">
                  <Stethoscope className="w-6 h-6 text-emerald-200" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white mb-1">Add New Staff Member</DialogTitle>
                  <DialogDescription className="text-emerald-100/80 text-sm">
                    Complete the form below to register a new staff member to the system
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Form Content with Scroll - Fixed height and proper scrolling */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[calc(90vh-140px)] overflow-y-auto">
            <div className="px-6 py-4">
              <div className="space-y-6 pb-4">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    
                    {/* Staff Type Selection */}
                    <Card className="border-emerald-500/30 shadow-sm bg-slate-800/90 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-emerald-400 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Staff Type
                        </CardTitle>
                        <CardDescription className="text-emerald-300/70">
                          Select the role for this staff member
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                              Available Now
                            </Badge>
                            <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                              Coming Soon
                            </Badge>
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {TYPES.map((type) => (
                            <label
                              key={type.value}
                              className={`relative flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                form.watch("role") === type.value
                                  ? "border-emerald-500 bg-emerald-500/10"
                                  : "border-emerald-500/30 bg-slate-800/50 hover:border-emerald-400/50 hover:bg-emerald-500/5"
                              } ${type.comingSoon ? "opacity-60" : ""}`}
                            >
                              <div className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  value={type.value}
                                  {...form.register("role")}
                                  disabled={type.comingSoon}
                                  className="w-4 h-4 text-emerald-600 bg-transparent border-emerald-500 focus:ring-emerald-500 focus:ring-2"
                                />
                                <div className="flex flex-col">
                                  <span className="text-emerald-100 font-medium">{type.label}</span>
                                  {type.comingSoon && (
                                    <Badge 
                                      variant="outline" 
                                      className="mt-1 text-xs border-amber-500/30 text-amber-300 bg-amber-500/10 w-fit"
                                    >
                                      Coming Soon
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card className="border-emerald-500/30 shadow-sm bg-slate-800/90 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-emerald-400 flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Personal Information
                        </CardTitle>
                        <CardDescription className="text-emerald-300/70">Basic details about the staff member</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <CustomInput
                          type="input"
                          control={form.control}
                          name="name"
                          placeholder="Enter full name"
                          label="Full Name"
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div className="relative">
                            <CustomInput
                              type="input"
                              control={form.control}
                              name="email"
                              placeholder="john.doe@hospital.com"
                              label="Email Address"
                            />
                            <Mail className="absolute right-3 top-9 w-4 h-4 text-emerald-400/60" />
                          </div>
                          <div className="relative">
                            <CustomInput
                              type="phone_input"
                              control={form.control}
                              name="phone"
                              placeholder="(555) 123-4567"
                              label="Phone Number"
                            />
                            <Phone className="absolute right-3 top-9 w-4 h-4 text-emerald-400/60" />
                          </div>
                        </div>

                        <div className="relative">
                          <CustomInput
                            type="input"
                            control={form.control}
                            name="address"
                            placeholder="1234 Main Street, City, State 12345"
                            label="Home Address"
                          />
                          <MapPin className="absolute right-3 top-9 w-4 h-4 text-emerald-400/60" />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Professional Information */}
                    <Card className="border-emerald-500/30 shadow-sm bg-slate-800/90 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-emerald-400 flex items-center gap-2">
                          <Building2 className="w-5 h-5" />
                          Professional Details
                        </CardTitle>
                        <CardDescription className="text-emerald-300/70">Work-related information and credentials</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <CustomInput
                            type="select"
                            selectList={DEFAULT_DEPARTMENTS}
                            control={form.control}
                            name="department"
                            placeholder="Choose department"
                            label="Department"
                          />
                          
                          <CustomInput
                            type="input"
                            control={form.control}
                            name="license_number"
                            placeholder="Enter license number"
                            label="Professional License Number"
                          />
                        </div>
                      </CardContent>
                    </Card>

                    {/* Security */}
                    <Card className="border-emerald-500/30 shadow-sm bg-slate-800/90 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-emerald-400 flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          Account Security
                        </CardTitle>
                        <CardDescription className="text-emerald-300/70">Set up login credentials for the staff member</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="relative">
                          <CustomInput
                            type="input"
                            control={form.control}
                            name="password"
                            placeholder="Create a secure password"
                            label="Password"
                            inputType={showPassword ? "text" : "password"}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-8 h-8 w-8 p-0 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Separator className="bg-emerald-500/30" />

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="flex-1 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-400/50 bg-transparent"
                      >
                        Cancel
                      </Button>
                      
                      <Button 
                        type="submit" 
                        disabled={isLoading} 
                        className="flex-1 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 shadow-lg shadow-emerald-500/25 transition-all duration-300 relative overflow-hidden group"
                      >
                        {/* Button shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processing...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Add Staff Member
                          </div>
                        )}
                      </Button>
                    </div>

                    {/* Help Text */}
                    <div className="text-center pt-2">
                      <p className="text-sm text-emerald-400/70">
                        All fields are required. The staff member will receive login credentials via email.
                      </p>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};