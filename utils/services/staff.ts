import db from "@/lib/db";
import { daysOfWeek } from "..";
import { auth } from "@clerk/nextjs/server";
import { processAppointments } from "./patientFetchInfo";


export async function getAllStaff({
  page,
  limit,
  search,
}: {
  page: number | string;
  limit?: number | string;
  search?: string;
}) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;

    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    const [staff, totalRecords] = await Promise.all([
      db.staff.findMany({
        where: {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },

        skip: SKIP,
        take: LIMIT,
      }),
      db.staff.count(),
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT);

    return {
      success: true,
      data: staff,
      totalRecords,
      totalPages,
      currentPage: PAGE_NUMBER,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getStaffDashboardStatistics() {
  try {
    const todayDate = new Date().getDay();
    const today = daysOfWeek[todayDate];

    const [totalPatient, totalDoctors, totalNurses, appointments, nurses] =
    await Promise.all([
      db.patient.count(),
      db.doctor.count(),
      db.staff.count({where: {role: "NURSE"}}),
      db.appointment.findMany({
        include: {
          patient: {
            select: {
              id: true,
              last_name: true,
              first_name: true,
              img: true,
              colorCode: true,
              gender: true,
              date_of_birth: true,
            },
          },
          doctor: {
            select: {
              name: true,
              img: true,
              colorCode: true,
              specialization: true,
            },
          },
        },
        orderBy: { appointment_date: "desc" },
      }),
      db.staff.findMany({
        where: {
          role: "NURSE",
        },
        select: {
          id: true,
          name: true,
          department: true,
          img: true,
          colorCode: true,
          phone: true,        
          license_number: true,
          role: true,
          status: true,

        },
        take: 5,
      }),
    ]);

    const { appointmentCounts, monthlyData } = await processAppointments(appointments);

    const last5Records = appointments.slice(0, 5);

    return {
      success: true,
      totalPatient,
      totalDoctors,
      totalNurses,
      appointmentCounts,
      availableNurses: nurses,
      monthlyData,
      last5Records,
      totalAppointments: appointments.length,
      status: 200,
    };
  } catch (error) {
    console.log(error);

    return { error: true, message: "Something went wrong" };
  }
}