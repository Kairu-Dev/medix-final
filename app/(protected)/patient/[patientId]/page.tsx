import MedicalHistoryContainer from '@/components/medical-history-container';
import PatientRatingContainer from '@/components/patient-rating-container';
import { ProfileImage } from '@/components/profile-image';
import { Card } from '@/components/ui/card';
import { getPatientFullDataById } from '@/utils/services/patientFetchInfo';
import { auth } from '@clerk/nextjs/server';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { format, formatDate } from 'date-fns';
import Link from 'next/link';
import React from 'react'

interface ParamsProps {
    params: Promise<{ patientId: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}
/* eslint-disable */
const PatientProfilePage = async(props: ParamsProps) => {
    const searchParams = await props.searchParams
    const params = await props.params;
    let id = params.patientId;
    let patientId = params.patientId;
    const category = searchParams?.category || "medical-history";

    if (patientId === "self") {
        const {userId} = await auth();
        id = userId!;

    } else id = patientId;


    const {data} = await getPatientFullDataById(id);

    const SmallCard = ({ label, value }: { label: string; value: string }) => (
        <div className="w-full md:w-1/3">
            <span className="text-sm text-cyan-400/70">{label}</span>
            <p className="text-sm md:text-base capitalize text-amber-400/90">{value}</p>
        </div>
    );

  return (
    <div className="bg-black-800 border-gray-800 h-full rounded-xl py-6 px-3 2xl:p-6 flex flex-col lg:flex-row gap-6 border border-cyan-500/30 shadow-lg">

        <div className="w-full xl:w-3/4">

        <div className="w-full flex flex-col lg:flex-row gap-4">

        <Card className="bg-gradient-to-b from-blue-950/90 to-slate-950 rounded-xl p-4 w-full lg:w-[30%] border border-cyan-700/30 shadow-md flex flex-col items-center backdrop-blur-sm">

            <ProfileImage 
            url={data?.img!}
            name={data?.first_name + " " + data?.last_name}
            className="h-20 w-20 md:flex ring-2 ring-cyan-400 ring-offset-2 ring-offset-blue-950 shadow-[0_0_15px_rgba(54,238,255,0.4)]"
            textClassName="text-3xl"
            />

            <h1 className="font-semibold text-2xl mt-2 text-cyan-100 tracking-wider">
                {data?.first_name + " " + data?.last_name}
            </h1>

            <span className="text-sm text-cyan-300/70">{data?.email}</span>

            <div className="w-full flex items-center justify-center gap-2 mt-4">
                <div className="w-1/2 space-y-1 text-center">
                    <p className="text-xl font-medium text-amber-400/90">{data?.totalAppointments}</p>
                    <span className="text-xs text-cyan-400/70">Appointments</span>
                </div>
            </div>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-950/30 to-indigo-900/20 rounded-xl p-6 w-full lg:w-[70%] border border-indigo-700/30 shadow-md space-y-6 backdrop-blur-sm">
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center xl:justify-between gap-y-4 md:gap-x-0">
                <SmallCard label={"Gender"} value={data?.gender?.toLowerCase()!} />
                <SmallCard label={"Date of Birth"} value={formatDate(data?.date_of_birth!, "yyyy-MM-dd" )} />
                <SmallCard label={"Phone Number"} value={data?.phone!} />
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center xl:justify-between gap-y-4 md:gap-x-0">
                <SmallCard label={"Marital Status"} value={data?.marital_status!} />
                <SmallCard label={"Blood Group"} value={data?.blood_group!} />
                <SmallCard label={"Address"} value={data?.address!} />
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center xl:justify-between gap-y-4 md:gap-x-0">
                <SmallCard label={"Emergency Contact Name"} value={data?.emergency_contact_name!} />
                <SmallCard label={"Emergency Contact Number"} value={data?.emergency_contact_number!} />
                <SmallCard label={"Last Visit Date"} value={data?.lastVisit ? format(data?.lastVisit!, "yyyy-MM-dd") : "No recorded visit"} />
            </div>
        </Card>

        </div>

        <div className="mt-10">
            {
                category === "medical-history" && <MedicalHistoryContainer patientId={id} />
            }

            {/*
            {
                category === "payments" && <Payments patientId={id!} />
            }
            */}
        </div>

        </div>

        <div className="w-full xl:w-1/3">

        <div className="bg-gradient-to-b from-blue-950/90 to-slate-950 p-4 rounded-xl mb-8 border border-cyan-700/30 shadow-md">

        <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(54,238,255,0.6)]"></div>
                <h1 className="text-xl font-semibold text-cyan-100 tracking-wider">Quick Links</h1>
        </div>

                    <div className="mt-4 flex gap-4 flex-wrap text-xs">
                            <Link
                            className="p-3 rounded-md bg-cyan-900/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 transition-colors duration-200 shadow-inner hover:shadow-[0_0_8px_rgba(54,238,255,0.3)]"
                            href={`/record/appointments?id=${id}`}
                            >
                            Patient&apos;s Appointments
                            </Link>
                            <Link
                            className="p-3 rounded-md bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 transition-colors duration-200 shadow-inner hover:shadow-[0_0_8px_rgba(99,102,241,0.3)]"
                            href="?cat=medical-history"
                            >
                            Medical Records
                            </Link>
                            <VisuallyHidden>
                            <Link
                            className="p-3 rounded-md bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-700/50 transition-colors duration-200 shadow-inner hover:shadow-[0_0_8px_rgba(147,51,234,0.3)]"
                            href={`?category=payments`}
                            >
                            Medical Bills
                            </Link>
                            </VisuallyHidden>
                            
                            <Link className="p-3 rounded-md bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 transition-colors duration-200 shadow-inner hover:shadow-[0_0_8px_rgba(16,185,129,0.3)]" href={`/`}>
                            Dashboard
                            </Link>
                            
                            <VisuallyHidden>
                            <Link className="p-3 rounded-md bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-700/50 transition-colors duration-200 shadow-inner hover:shadow-[0_0_8px_rgba(225,29,72,0.3)]" href={`#`}>
                            Lab Test & Result
                            </Link>
                            </VisuallyHidden>
                            {patientId === "self" && (
                            <Link
                                className="p-3 rounded-md bg-amber-900/40 hover:bg-amber-900/60 text-amber-300 border border-amber-700/50 transition-colors duration-200 shadow-inner hover:shadow-[0_0_8px_rgba(245,158,11,0.3)]"
                                href={`/patient/registration`}
                            >
                                Edit Profile Information
                            </Link>
                            )}
                 
                </div>
        
            </div>

            <PatientRatingContainer id={id!} />
        </div>

    </div>
  )
}

export default PatientProfilePage

{/*

import MedicalHistoryContainer from '@/components/medical-history-container';
import PatientRatingContainer from '@/components/patient-rating-container';
import { ProfileImage } from '@/components/profile-image';
import { Card } from '@/components/ui/card';
import { getPatientFullDataById } from '@/utils/services/patientFetchInfo';
import { auth } from '@clerk/nextjs/server';
import { format, formatDate } from 'date-fns';
import Link from 'next/link';
import React from 'react'



interface ParamsProps {
    params: Promise<{ patientId: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const PatientProfilePage = async(props: ParamsProps) => {
    const searchParams = await props.searchParams
    const params = await props.params;
    let id = params.patientId;
    let patientId = params.patientId;
    const category = searchParams?.category || "medical-history";

    if (patientId === "self") {
        const {userId} = await auth();
        id = userId!;

    } else id = patientId;


    const {data} = await getPatientFullDataById(id);

    const SmallCard = ({ label, value }: { label: string; value: string }) => (

        <div className="w-full md:w-1/3">
            <span className="text-sm text-gray-500">{label}</span>
            <p className="text-sm md:text-base capitalize">{value}</p>
        </div>

    );



  return (
    <div className="bg-black-800/60 h-full rounded-xl py-6 px-3 2xl:p-6 flex flex-col lg:flex-row gap-6">

        <div className="w-full xl:w-3/4">

        <div className="w-full flex flex-col lg:flex-row gap-4">

        <Card className="bg-dark-500 rounded-xl p-4 w-full lg:w-[30%] border-none flex flex-col items-center">

            <ProfileImage 
            url={data?.img!}
            name={data?.first_name + " " + data?.last_name}
            className="h-20 w-20 md:flex"
            textClassName="text-3xl"
            />

            <h1 className="font-semibold text-2xl mt-2">
                {data?.first_name + " " + data?.last_name}
            </h1>

            <span className="text-sm text-gray-500">{data?.email}</span>

            <div className="w-full flex items-center justify-center gap-2 mt-4">
                <div className="w-1/2 space-y-1 text-center">
                    <p className="text-xl font-medium">{data?.totalAppointments}</p>
                    <span className="text-xs text-gray-500">Appointments</span>
                    
                </div>
            </div>
        </Card>

        <Card className="bg-green-600 rounded-xl p-6 w-full lg:w-[70%] border-none space-y-6">

            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center xl:justify-between gap-y-4 md:gap-x-0">

                    <SmallCard label={"Gender"} value={data?.gender?.toLowerCase()!} />

                    <SmallCard label={"Date of Birth"} value={formatDate(data?.date_of_birth!, "yyyy-MM-dd" )} />
                    
                    <SmallCard label={"Phone Number"} value={data?.phone!} />
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center xl:justify-between gap-y-4 md:gap-x-0">

                    <SmallCard label={"Marital Status"} value={data?.marital_status!} />
                    <SmallCard label={"Blood Group"} value={data?.blood_group!} />
                    <SmallCard label={"Address"} value={data?.address!} />
            </div>

            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center xl:justify-between gap-y-4 md:gap-x-0">

                    <SmallCard label={"Emergency Contact Name"} value={data?.emergency_contact_name!} />
                    <SmallCard label={"Emergency Contact Number"} value={data?.emergency_contact_number!} />
                    <SmallCard label={"Last Visit Date"} value={data?.lastVisit ? format(data?.lastVisit!, "yyyy-MM-dd") : "No recorded visit"} />
            </div>

        </Card>

        </div>

        <div className="mt-10">

            

            {
                category === "medical-history" && <MedicalHistoryContainer patientId={id} />
            }

            

            {/*

            {
                category === "payments" && <Payments patientId={id!} />
            }

            

        </div>

        </div>

        <div className="w-full xl:w-1/3">

        <div className="bg-dark-500 p-4 rounded-md mb-8">

            <h1 className="text-xl font-semibold">Quick Links</h1>

                    <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
                            <Link
                            className="p-3 rounded-md bg-yellow-50 hover:underline"
                            href={`/record/appointments?id=${id}`}
                            >
                            Patient&apos;s Appointments
                            </Link>
                            <Link
                            className="p-3 rounded-md bg-purple-50 hover:underline"
                            href="?cat=medical-history"
                            >
                            Medical Records
                            </Link>
                            <Link
                            className="p-3 rounded-md bg-violet-100"
                            href={`?cat=payments`}
                            >
                            Medical Bills
                            </Link>
                            <Link className="p-3 rounded-md bg-pink-50" href={`/`}>
                            Dashboard
                            </Link>

                            <Link className="p-3 rounded-md bg-rose-100" href={`#`}>
                            Lab Test & Result
                            </Link>
                            {patientId === "self" && (
                            <Link
                                className="p-3 rounded-md bg-black/10"
                                href={`/patient/registration`}
                            >
                                Edit Profile Information
                            </Link>
                            )}
                 
                </div>
        
            </div>

            <PatientRatingContainer id={id!} />

          

   

        </div>

    </div>
  )
}

export default PatientProfilePage

*/}