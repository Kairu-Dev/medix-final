"use server";

import db from "@/lib/db";


export async function getDoctorLoadFactors(doctorIds: string[]) {
  try {
    const loadFactors: Record<string, number> = {};
    
    // Fetch pending appointments count for each doctor
    const results = await Promise.all(
      doctorIds.map(async (doctorId) => {
        const count = await db.appointment.count({
          where: {
            doctor_id: doctorId,
            status: 'PENDING'
          }
        });
        return { doctorId, count };
      })
    );
    
    // Build the load factors object
    results.forEach(({ doctorId, count }) => {
      loadFactors[doctorId] = count;
    });
    
    return { success: true, loadFactors };
  } catch (error) {
    console.error("Error fetching doctor load factors:", error);
    return { success: false, loadFactors: {} };
  }
}