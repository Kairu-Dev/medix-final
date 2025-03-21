import NewPatient from '@/components/new-patient';
import { getPatientById } from '@/utils/services/patientFetchInfo';
import { auth } from '@clerk/nextjs/server';
import React from 'react'

const Registration = async () => {

  const {userId} = await auth()
  
  const {data} = await getPatientById(userId!)


  return (

    /*<div className="py-6 px-3 flex justify-center">
        //<NewPatient data={data!} type={!data ? "create" : "update"} />
    </div> */

    <div className="w-full h-full flex justify-center py-6 px-3">
      <div className="max-w-6xl w-full relative pb-10">
        <NewPatient data={data!} type={!data ? "create" : "update"} />
      </div>
    </div>

  );
  
  
};

export default Registration