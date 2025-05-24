import React from 'react';
import { NurseBookAppointment } from './nurse-book-appointment';
import { getDoctors } from '@/utils/services/doctor';
import { Patient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

interface NurseAppointmentWrapperProps {
  patient: Patient;
}

export const NurseAppointmentWrapper = async ({ patient }: NurseAppointmentWrapperProps) => {
  const { data: doctors } = await getDoctors();
  const { userId } = await auth();

  if (!doctors || !userId) return null;

  return (
    <NurseBookAppointment 
      patient={patient} 
      doctors={doctors} 
      nurseId={userId} 
    />
  );
};

export default NurseAppointmentWrapper;