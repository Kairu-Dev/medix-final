import React from 'react'
import { Patient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import Image from "next/image";
import { calculateAge } from '@/utils';
import { Calendar, Home, Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';

export const PatientDetailsCard = ({ data }: { data: Patient }) => { 
  return (
    <Card className="w-full rounded-xl bg-gray-900/60 border border-emerald-500/40 shadow-lg relative backdrop-blur-sm">
        {/* Minecraft-style decorative elements */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
        
        {/* Enhanced emerald glow effects */}
        <div className="absolute -top-5 right-10 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-5 left-10 w-24 h-24 bg-emerald-200/15 rounded-full blur-3xl"></div>
        
        <CardHeader className="relative z-10">
            <CardTitle className="text-lg font-bold text-emerald-100 tracking-wider font-mono uppercase">Patient Details</CardTitle>
            <div className="relative size-20 xl:size-24 rounded-full overflow-hidden border-2 border-emerald-500/50 shadow-md shadow-emerald-500/30">
                <Image 
                src={data.img || "/user.jpg"}
                alt={data?.first_name}
                width={100}
                height={100}
                className="rounded-full"
                />
            </div>

            <div className="mt-2">
                <h2 className="text-lg font-semibold text-emerald-100">
                    {data?.first_name} {data?.last_name}
                </h2>
                <p className="text-sm text-emerald-300/80" >
                    {data?.email} - {data?.phone}
                </p>
                <p className="text-sm text-emerald-300/80">
                    {data?.gender} - {calculateAge(data?.date_of_birth)}
                </p>
            </div>
        </CardHeader>
        <CardContent className="mt-4 space-y-4 relative z-10 g-gray-900/60 rounded-xl p-4 ">
            <div className="flex items-start gap-3">
                <Calendar size={22} className="text-emerald-400" />
                <div>
                    <p className="text-sm text-emerald-300/80">Date of Birth</p>
                    <p className="text-base font-medium text-emerald-100">
                        {format(new Date(data?.date_of_birth), "MMM dd yyyy")}
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <Home size={22} className="text-emerald-400" />
                <div>
                    <p className="text-sm text-emerald-300/80">Address</p>
                    <p className="text-base font-medium text-emerald-100">
                        {data?.address}
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <Mail size={22} className="text-emerald-400" />
                <div>
                    <p className="text-sm text-emerald-300/80">Email</p>
                    <p className="text-base font-medium text-emerald-100">
                        {data?.email}
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <Phone size={22} className="text-emerald-400" />
                <div>
                    <p className="text-sm text-emerald-300/80">Phone Number</p>
                    <p className="text-base font-medium text-emerald-100">
                        {data?.phone}
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <Home size={22} className="text-emerald-400" />
                <div>
                    <p className="text-sm text-emerald-300/80">Active Conditions</p>
                    <p className="text-base font-medium text-emerald-100">
                      {data?.medical_conditions}
                    </p>
                </div>
            </div>
            <div className="flex items-start gap-3">
                <Home size={22} className="text-emerald-400" />
                <div>
                    <p className="text-sm text-emerald-300/80">Allergies</p>
                    <p className="text-base font-medium text-emerald-100">
                      {data?.allergies}
                    </p>
                </div>
            </div>
        </CardContent>
    </Card>
  )
};