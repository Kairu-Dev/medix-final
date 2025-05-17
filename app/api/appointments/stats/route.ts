import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { AppointmentStatus } from '@prisma/client';

export async function GET() {
  try {
    // Get count of pending appointments for each doctor
    const doctorStats = await db.doctor.findMany({
      select: {
        id: true,
        name: true,
        specialization: true,
        appointments: {
          where: {
            status: AppointmentStatus.PENDING
          }
        }
      }
    });

    // Transform the data for easier consumption
    const formattedStats = doctorStats.map(doctor => ({
      doctorId: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      pendingCount: doctor.appointments.length
    }));

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error('Error fetching appointment statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment statistics' },
      { status: 500 }
    );
  }
}



{/*
  // app/api/appointments/stats/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AppointmentStatus } from '@prisma/client';

export async function GET() {
  try {
    // Get count of pending appointments for each doctor
    const doctorStats = await prisma.doctor.findMany({
      select: {
        id: true,
        name: true,
        specialization: true,
        _count: {
          select: {
            appointments: {
              where: {
                status: AppointmentStatus.PENDING
              }
            }
          }
        }
      }
    });

    // Transform the data for easier consumption
    const formattedStats = doctorStats.map(doctor => ({
      doctorId: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      pendingCount: doctor._count.appointments
    }));

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error('Error fetching appointment statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment statistics' },
      { status: 500 }
    );
  }
}
  
  */}