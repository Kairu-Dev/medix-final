
"use server"
import db from "@/lib/db";

export async function getDoctorWorkingDays(doctorId: string) {
  try {
    const workingDays = await db.workingDays.findMany({
      where: {
        doctor_id: doctorId,
      },
      select: {
        id: true,
        doctor_id: true,
        day: true,
        start_time: true,
        close_time: true,
      },
      orderBy: [
        {
          // Custom ordering for days of the week
          day: 'asc'
        }
      ]
    });

    return {
      success: true,
      workingDays
    };
  } catch (error) {
    console.error("Error fetching doctor working days:", error);
    return {
      success: false,
      workingDays: [],
      error: "Failed to fetch doctor working days"
    };
  }
}