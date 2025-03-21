import { AvailableDoctorProps } from '@/types/data-types'
import { checkRole } from '@/utils/roles';
import React from 'react'
import { Button } from './ui/button';
import Link from 'next/link';
import { ProfileImage } from './profile-image';
import { Card } from './ui/card';
import { daysOfWeek } from '@/utils';
import { log } from 'console';

const getToday = () => {
    
    const today = new Date().getDay();
    return daysOfWeek[today];   
}

const todayDay = getToday();

interface Days {
    day: string;
    start_time: string;
    close_time: string;
}

interface DataProps {
    data: AvailableDoctorProps;
}

export const availableDays = ({data}: {data: Days[]}) => {
    const isTodayWorkingDay = data?.find((dayObj) => dayObj?.day?.toLowerCase() === todayDay)
    return isTodayWorkingDay
    ? `${isTodayWorkingDay?.start_time} - ${isTodayWorkingDay?.close_time}`
    : " Not Available";
};

export const AvailableDoctors = async ({ data }: DataProps ) => {
  return (
    <div className="bg-black-800 rounded-xl p-4 border border-gray-800 shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-3">
            <h1 className="sub-header text-white flex items-center">
                <span className="inline-block w-1 h-6 bg-teal-400 mr-2 rounded"></span>
                Available Doctors
            </h1>

            {
                (await checkRole("ADMIN")) && (
                <Button asChild
                variant={"outline"}
                disabled={data?.length === 0}
                className="disabled:cursor-not-allowed disabled:text-gray-200 bg-transparent hover:bg-teal-500/20 border-teal-500/50 text-teal-400 hover:text-teal-300 transition-all duration-300"
                >
                    <Link href="/records/doctors">View All</Link>
                </Button>
            )}
        </div>

        <div className="w-full space-y-5 md:space-y-0 md:gap-6 flex flex-col md:flex-row md:flex-wrap">
            {
                data?.map((doc, id) => {
                    const isAvailableToday = doc?.working_days?.some((dayObj) => dayObj?.day?.toLowerCase() === todayDay);
                    
                    return (
                    <Card 
                    key={id} 
                    className="border-none w-full md:w-[300px] min-h-28 xl:w-full p-4 flex gap-4 hover:translate-y-[-2px] transition-all duration-300 overflow-hidden relative"
                    style={{
                        background: id % 2 === 0 
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.07) 0%, rgba(16, 185, 129, 0.02) 100%)' 
                            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.07) 0%, rgba(245, 158, 11, 0.02) 100%)'
                    }}
                    >
                        <ProfileImage 
                        url={doc?.img}
                        name={doc?.name}
                        className="md:flex min-w-14 min-h-14 md:min-w-16 md:min-h-16 ring-2 ring-offset-2 ring-offset-black-800 ring-teal-500/30"
                        textClassName="text-2xl font-semibold"
                     
                        />

                        <div>
                            <h2 className="font-semibold text-lg md:text-xl text-white">{doc?.name}</h2>
                            <p className="text-16-semibold capitalize text-teal-400/90">{doc?.specialization}</p>
                            <p className="text-sm flex items-center gap-1 mt-1 text-gray-300">
                                <span className="text-gray-400">Available Time:</span>
                                <span className={`font-medium ${isAvailableToday ? 'text-amber-400' : 'text-gray-500'}`}>
                                    {availableDays({data: doc?.working_days})}
                                </span>
                            </p>
                        </div>
                        
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-teal-500/5"></div>
                    </Card>
                    );
                })
            }
        </div>
    </div>

    
  )
}

export default AvailableDoctors



//OLD CODE
{/*

import { AvailableDoctorProps } from '@/types/data-types'
import { checkRole } from '@/utils/roles';
import React from 'react'
import { Button } from './ui/button';
import Link from 'next/link';
import { ProfileImage } from './profile-image';
import { Card } from './ui/card';
import { daysOfWeek } from '@/utils';

const getToday = () => {

    
    const today = new Date().getDay();
    return daysOfWeek[today];   
}

const todayDay = getToday();

interface Days {
    day: string;
    start_time: string;
    close_time: string;
}

interface DataProps {
    data: AvailableDoctorProps;
}

const availableDays = ({data}: {data: Days[]}) => {
    const isTodayWorkingDay = data?.find((dayObj) => dayObj?.day?.toLowerCase() === todayDay)
    return isTodayWorkingDay
    ? `${isTodayWorkingDay?.start_time} - ${isTodayWorkingDay?.close_time}`
    : " Not Available";
};

export const AvailableDoctors = async ({ data }: DataProps ) => {
  return (
    <div className="bg-black-800 rounded-xl p-4">
        <div className="flex justify-between items-center mb-6">
            <h1 className="sub-header">Available Doctors</h1>

            {
                (await checkRole("ADMIN")) && (
                <Button asChild
                variant={"outline"}
                disabled={data?.length === 0}
                className="disabled:cursor-not-allowed disabled:text-gray-200"
                >
                    <Link href="/records/doctors">View All</Link>
                </Button>
            )}
        </div>

        <div className="w-full space-y-5 md:space-y-0 md:gap-6 flex flex-col md:flex-row md:flex-wrap">
            {
                data?.map((doc, id) => (
                    <Card 
                    key={id} 
                    className=" border-none  w-full md:w-[300px] min-h-28 xl:w-full p-4 flex  gap-4 odd:bg-emerald-600/5 even:bg-yellow-600/5"
                    
                    >
                        <ProfileImage 
                        url={doc?.img}
                        name={doc?.name}
                        className="md:flex min-w-14 min-h-14 md:min-w-16 md:min-h-16"
                        textClassName="text-2xl font-semibold"
                        
                        />

                        <div>
                            <h2 className="font-semibold text-lg md:text-xl">{doc?.name}</h2>
                            <p className="text-16-semibold capitalize text-gray-500">{doc?.specialization}</p>
                            <p className="text-sm flex items-center">
                                <span>Available Time: </span>
                                {availableDays({data: doc?.working_days})}
                            </p>
                        </div>

                    </Card>
                ) )
            }
        </div>
    </div>
  )
}

export default AvailableDoctors

*/}