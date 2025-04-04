import { checkRole } from '@/utils/roles';
import React from 'react'
import { Button } from './ui/button';
import Link from 'next/link';
import { ProfileImage } from './profile-image';
import { Card } from './ui/card';
import { AvailableNurseProps } from '@/types/data-types';
import { Badge } from './ui/badge';
/* eslint-disable */

interface DataProps {
    data: AvailableNurseProps[];
}

export const AvailableNurses = async ({ data }: DataProps ) => {
    console.log("Received data:", data);
  return (
    <div className="bg-black-800 rounded-xl p-4 border border-gray-800 shadow-lg">
        <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-3">
            <h1 className="sub-header text-white flex items-center">
                Available Nurses
            </h1>

            {
                (await checkRole("ADMIN")) && (
                <Button asChild
                variant={"outline"}
                disabled={data?.length === 0}
                className="disabled:cursor-not-allowed disabled:text-gray-200 bg-transparent hover:bg-blue-500/20 border-blue-500/50 text-blue-400 hover:text-blue-300 transition-all duration-300"
                >
                    <Link href="/record/staff">View All</Link>
                </Button>
            )}
        </div>

        <div className="w-full space-y-5 md:space-y-0 md:gap-6 flex flex-col md:flex-row md:flex-wrap">
            {
                data?.map((staff, id) => {
                    // Status badge variant and color
                    const statusVariant = staff.status === "ACTIVE" ? "outline" : "outline";
                    const statusClassName = staff.status === "ACTIVE" 
                      ? "border-green-500 bg-green-500/20 text-green-400 hover:bg-green-500/20" 
                      : "border-red-500 bg-red-500/20 text-red-400 hover:bg-red-500/20";

                    return (
                    <Card 
                    key={id} 
                    className="border-none w-full md:w-[300px] min-h-28 xl:w-full p-4 flex gap-4 hover:translate-y-[-2px] transition-all duration-300 overflow-hidden relative"
                    style={{
                        background: id % 2 === 0 
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.07) 0%, rgba(59, 130, 246, 0.02) 100%)' 
                            : 'linear-gradient(135deg, rgba(236, 72, 153, 0.07) 0%, rgba(236, 72, 153, 0.02) 100%)'
                    }}
                    >
                        <ProfileImage 
                        url={staff?.img}
                        name={staff?.name}
                        className="md:flex min-w-14 min-h-14 md:min-w-16 md:min-h-16 ring-2 ring-offset-2 ring-offset-black-800 ring-blue-500/30"
                        textClassName="text-2xl font-semibold"
                        bgColor={staff?.colorCode!}
                        />

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h2 className="font-semibold text-lg md:text-xl text-white">{staff?.name}</h2>
                                {staff?.status && (
                                  <Badge variant={statusVariant} className={`text-xs font-medium ${statusClassName}`}>
                                    {staff.status}
                                  </Badge>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                                <p className="text-16-semibold capitalize text-blue-400/90">{staff?.department || 'General'}</p>
                                {staff?.role && (
                                  <Badge variant="outline" className="text-xs bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/20">
                                    {staff.role}
                                  </Badge>
                                )}
                            </div>
                            
                            {staff?.license_number && (
                              <p className="text-sm flex items-center gap-1 mt-1 text-gray-300">
                                <span className="text-gray-400">License:</span>
                                <span className="font-medium text-pink-400">
                                  {staff.license_number}
                                </span>
                              </p>
                            )}
                            
                            {staff?.phone && (
                              <p className="text-sm flex items-center gap-1 mt-1 text-gray-300">
                                <span className="text-gray-400">Contact:</span>
                                <span className="font-medium text-gray-300">
                                  {staff.phone}
                                </span>
                              </p>
                            )}
                        </div>
                        
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-blue-500/5"></div>
                    </Card>
                    );
                })
            }
        </div>
    </div>
  )
}

export default AvailableNurses