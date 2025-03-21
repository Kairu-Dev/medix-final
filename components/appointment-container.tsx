import React from 'react'
import BookAppointment from './forms/book-appointment'
import { getPatientById } from '@/utils/services/patientFetchInfo';
import { getDoctors } from '@/utils/services/doctor';

export const AppointmentContainer =  async( {id}: {id:string} ) => {
    const {data} = await getPatientById(id);
    const {data:doctors} = await getDoctors();
  return (
    <div>

        <BookAppointment data={data!} doctors={doctors!}/>

    </div>
    
  )
}

export default AppointmentContainer