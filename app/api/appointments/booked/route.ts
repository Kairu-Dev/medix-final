// app/api/appointments/booked/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust import path as needed

export async function POST(request: NextRequest) {
  try {
    const { doctorId, date } = await request.json();

    if (!doctorId || !date) {
      return NextResponse.json(
        { error: 'Doctor ID and date are required' },
        { status: 400 }
      );
    }

    // Parse the date to ensure proper comparison
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch appointments for the specific doctor and date
    const appointments = await prisma.appointment.findMany({
      where: {
        doctor_id: doctorId,
        appointment_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          in: ['PENDING', 'SCHEDULED'], // Only consider active appointments
        },
      },
      select: {
        id: true,
        time: true,
        status: true,
        priority_level: true,
        patient: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: {
        time: 'asc',
      },
    });

    // Transform the data for the frontend
    const bookedAppointments = appointments.map(appointment => ({
      id: appointment.id,
      time: appointment.time,
      status: appointment.status,
      priority_level: appointment.priority_level,
      patient_name: `${appointment.patient.first_name} ${appointment.patient.last_name}`,
    }));

    return NextResponse.json({
      success: true,
      appointments: bookedAppointments,
    });

  } catch (error) {
    console.error('Error fetching booked appointments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
