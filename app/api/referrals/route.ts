// File: app/api/referral-data/route.ts
import { NextResponse } from 'next/server';
import db from "@/lib/db";
import { getDepartments } from "@/utils/services/referral-utils";

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const patientId = url.searchParams.get('patientId');
    const doctorId = url.searchParams.get('doctorId');

    if (!patientId || !doctorId) {
      return NextResponse.json(
        { error: 'Patient ID and Doctor ID are required' },
        { status: 400 }
      );
    }

    // Fetch all required data
    const [patientData, doctorData, allDoctors, departmentsData] = await Promise.all([
      db.patient.findUnique({
        where: { id: patientId }
      }),
      db.doctor.findUnique({
        where: { id: doctorId }
      }),
      db.doctor.findMany(),
      getDepartments()
    ]);

    return NextResponse.json({
      success: true,
      data: {
        patient: patientData,
        currentDoctor: doctorData,
        doctors: allDoctors,
        departments: departmentsData.data || []
      }
    });
  } catch (error) {
    console.error("Error fetching referral data:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}