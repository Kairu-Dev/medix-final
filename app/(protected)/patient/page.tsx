import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const PatientDashBoard = async() => {
  
  const user = await currentUser()

  const data = null;

  if(user && !data) {
    redirect("/patient/registration/");
  }
   
  return (
    <div>
      PatientDashBoard
      <UserButton />
      
    </div>

  )
}

export default PatientDashBoard