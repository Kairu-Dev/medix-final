import { Diagnosis, LabTest, MedicalRecords, Patient } from '@prisma/client'
import { Scroll } from 'lucide-react';
import React from 'react'
import { Table } from './tables/table';
import { ProfileImage } from './profile-image';
import { formatDateTime } from '@/utils';
import { ViewAction } from './action-options';
import { MedicalHistoryDialog } from './medical-history-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
 /* eslint-disable */

export interface ExtendedMedicalHistory extends MedicalRecords {
    patient?: Patient;
    diagnosis: Diagnosis[];
    lab_test: LabTest[];
    index?: number;
}

interface DataProps {
    data: ExtendedMedicalHistory[];
    isShowProfile?: boolean;
    
}

export const MedicalHistory = ({data, isShowProfile }: DataProps) => {

    const columns = [
        {
          header: "No",
          key: "no",
          className:"text-amber-400/90"
        },
        {
          header: "Info",
          key: "name",
          className: isShowProfile ? "table-cell" : "hidden",
        },
        {
          header: "Date & Time",
          key: "medical_date",
          className: "text-amber-400/90",
        },
        {
          header: "Doctor",
          key: "doctor",
          className: "hidden xl:table-cell text-amber-400/90",
        },
        {
          header: "Diagnosis",
          key: "diagnosis",
          className: "hidden md:table-cell text-amber-400/90",
        },

        
      ];

      const renderRow = (item: ExtendedMedicalHistory) => {
        return (
          <tr
            key={item.id}
            className="border-b border-amber-200/20 even:bg-amber-50/10 text-sm hover:bg-amber-50/20 transition-colors duration-300"
          >
            <td className="py-2 xl:py-6 text-amber-700"># {item?.id}</td>
    
            {isShowProfile && (
              <td className="flex items-center gap-2 2xl:gap-4 py-2 xl:py-4">
                <ProfileImage
                  url={item?.patient?.img!}
                  name={item?.patient?.first_name + " " + item?.patient?.last_name}
                  className="ring-2 ring-amber-400 ring-offset-1 ring-offset-amber-50/20"
                />
                <div>
                  <h3 className="font-semibold text-amber-700">
                    {item?.patient?.first_name + " " + item?.patient?.last_name}
                  </h3>
                  <span className="text-xs capitalize hidden md:flex text-amber-600/80">
                    {item?.patient?.gender.toLowerCase()}
                  </span>
                </div>
              </td>
            )}
    
            <td className="text-amber-700">{formatDateTime(item?.created_at.toString())}</td>
    
            <td className="hidden items-center py-2 xl:table-cell text-amber-700">
              {item?.doctor_id}
            </td>
            <td className="hidden lg:table-cell">
              {item?.diagnosis?.length === 0 ? (
                <span className="text-sm italic text-amber-500/60">
                  No diagnosis found
                </span>
              ) : (
                <>
                
                  <MedicalHistoryDialog
                    id={item?.appointment_id}
                    patientId={item?.patient_id}
                    doctor_id={item?.doctor_id}
                    label={
                      <div className="flex gap-x-2 items-center text-lg text-amber-700">
                        {item?.diagnosis?.length}
    
                        <span className="text-sm text-amber-600">Found</span>
                      </div>
                    }
                  />
                  
                </>
                
              )}
            </td>
    
            <td>
             <ViewAction href={`/record/appointments/${item?.appointment_id}`} /> 
            </td>
          </tr>
        );
      };

  return (
    <div className="bg-gradient-to-br from-amber-50/10 to-amber-100/5 rounded-xl p-4 2xl:p-6 border border-amber-200/30 shadow-lg relative overflow-hidden backdrop-blur-sm">
        {/* Genshin-style ornamental corner decorations */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/60 rounded-tl-xl"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-400/60 rounded-tr-xl"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-400/60 rounded-bl-xl"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/60 rounded-br-xl"></div>
        
        {/* Light glow effects */}
        <div className="absolute -top-10 right-20 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 left-40 w-40 h-40 bg-amber-200/10 rounded-full blur-3xl"></div>
        
        <div className="relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-1 bg-amber-400 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]"></div>
                    <h1 className="font-bold header text-amber-700 tracking-wider">Medical History</h1>
                </div>
                <div className="hidden lg:flex items-center gap-3 bg-amber-50/20 px-4 py-2 rounded-lg border border-amber-200/30">
                    <Scroll size={24} className="text-amber-600" />
                    <div className="flex flex-col">
                        <p className="text-2xl font-semibold text-amber-700">{data?.length}</p>
                        <span className="text-amber-400/90 text-sm">
                            Records Found
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50/10 to-transparent p-1 rounded-lg border border-amber-200/30 shadow-inner">
                <Table 
                    columns={columns} 
                    renderRow={renderRow} 
                    data={data} 
                   
                />
            </div>
        </div>
    </div>
  )
}

export default MedicalHistory


{/*

import { Diagnosis, LabTest, MedicalRecords, Patient } from '@prisma/client'
import { BriefcaseBusiness } from 'lucide-react';
import React from 'react'
import { Table } from './tables/table';
import { ProfileImage } from './profile-image';
import { formatDateTime } from '@/utils';
import { ViewAction } from './action-options';
import { MedicalHistoryDialog } from './medical-history-dialog';

export interface ExtendedMedicalHistory extends MedicalRecords {
    patient?: Patient;
    diagnosis: Diagnosis[];
    lab_test: LabTest[];
    index?: number;
}

interface DataProps {
    data: ExtendedMedicalHistory[];
    isShowProfile?: boolean;
    
}

export const MedicalHistory = ({data, isShowProfile }: DataProps) => {

    const columns = [
        {
          header: "No",
          key: "no",
        },
        {
          header: "Info",
          key: "name",
          className: isShowProfile ? "table-cell" : "hidden",
        },
        {
          header: "Date & Time",
          key: "medical_date",
          className: "",
        },
        {
          header: "Doctor",
          key: "doctor",
          className: "hidden xl:table-cell",
        },
        {
          header: "Diagnosis",
          key: "diagnosis",
          className: "hidden md:table-cell",
        },
        {
          header: "Lab Test",
          key: "lab_test",
          className: "hidden 2xl:table-cell",
        },
      ];

      const renderRow = (item: ExtendedMedicalHistory) => {
        return (
          <tr
            key={item.id}
            className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
          >
            <td className="py-2 xl:py-6"># {item?.id}</td>
    
            {isShowProfile && (
              <td className="flex items-center gap-2 2xl:gap-4 py-2 xl:py-4">
                <ProfileImage
                  url={item?.patient?.img!}
                  name={item?.patient?.first_name + " " + item?.patient?.last_name}
                />
                <div>
                  <h3 className="font-semibold">
                    {item?.patient?.first_name + " " + item?.patient?.last_name}
                  </h3>
                  <span className="text-xs capitalize hidden md:flex">
                    {item?.patient?.gender.toLowerCase()}
                  </span>
                </div>
              </td>
            )}
    
            <td className="">{formatDateTime(item?.created_at.toString())}</td>
    
            <td className="hidden  items-center py-2  xl:table-cell">
              {item?.doctor_id}
            </td>
            <td className="hidden lg:table-cell">
              {item?.diagnosis?.length === 0 ? (
                <span className="text-sm italic text-gray-500">
                  No diagnosis found
                </span>
              ) : (
                <>
                
                  <MedicalHistoryDialog
                    id={item?.appointment_id}
                    patientId={item?.patient_id}
                    doctor_id={item?.doctor_id}
                    label={
                      <div className="flex gap-x-2 items-center text-lg">
                        {item?.diagnosis?.length}
    
                        <span className="text-sm">Found</span>
                      </div>
                    }
                  />
                  
                </>
                
              )}
            </td>
            <td className="hidden 2xl:table-cell">
              {item?.lab_test?.length === 0 ? (
                <span className="text-sm italic text-gray-500">
                  No lab test found
                </span>
              ) : (
                <div className="flex gap-x-2 items-center text-lg">
                  {item?.lab_test?.length}
    
                  <span className="text-sm">Found</span>
                </div>
              )}
            </td>
    
            <td>
             <ViewAction href={`/record/appointments/${item?.appointment_id}`} /> 
            </td>
          </tr>
        );
      };

  return (
    <div className="bg-green-600 rounded-xl p-2 2xl:p-6">
        <div className="">
            <h1 className="font-semibold text-xl">Medical History (All) </h1>
            <div className="hidden lg:flex items-center gap-1">
                <BriefcaseBusiness size={20} className="text-gray-500" />
                <p className="text-2xl font-semibold">{data?.length}</p>
                <span className="text-gray-600 text-sm xl:text-base">
                    Total Records
                </span>
            </div>
        </div>
        <Table columns={columns} renderRow={renderRow} data={data} />
    </div>
  )
}

export default MedicalHistory


*/}