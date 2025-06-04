import React from 'react'
import { getPatientById } from '@/utils/services/patientFetchInfo';
import { getDoctors } from '@/utils/services/doctor';
import { checkRole } from '@/utils/roles';
import { auth } from '@clerk/nextjs/server';
import EnhancedBookAppointment from './forms/book-appointment';

export const AppointmentContainer = async({ id }: { id: string }) => {
    const { data: patient } = await getPatientById(id);
    const { data: doctors } = await getDoctors();
    const isNurse = await checkRole("NURSE");
    const { userId } = await auth();
    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");
    
    if (!patient || !doctors) return null;

    return (
        <EnhancedBookAppointment 
            data={patient} 
            doctors={doctors}
            bookedBy={isNurse ? userId ?? undefined : undefined}
            isNurseBooking={isNurse}

            isNurse={isNurse}
            isAdmin={isAdmin}
            isDoctor={isDoctor}
            userId={userId}

        />
    );
}

export default AppointmentContainer;