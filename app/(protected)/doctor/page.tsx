import { checkRole, getRole } from '@/utils/roles'
import { redirect } from 'next/navigation'
import React from 'react'

const DoctorDashboard =  async() => {
  // Protect the page from users who are not admins
  const isDoctor = await checkRole("DOCTOR");
  const role = await getRole();

  if (!isDoctor) {
    redirect(`/${role}`);
  }
  
  return <div>DoctorDashboard</div>;
};

export default DoctorDashboard;