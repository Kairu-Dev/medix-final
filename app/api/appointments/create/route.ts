import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { checkRole } from '@/utils/roles';
import db from '@/lib/db';
import { AppointmentStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has appropriate role
    const hasAccess = await checkRole("ADMIN");
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Unauthorized - Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const { 
      patientId, 
      targetDoctorId, 
      condition, 
      isEmergency, 
      notes 
    } = body;

    // Validate required fields
    if (!patientId || !targetDoctorId) {
      return NextResponse.json(
        { error: 'Patient ID and Doctor ID are required' },
        { status: 400 }
      );
    }

    // Set appointment date to tomorrow for normal referrals, today for emergency
    const appointmentDate = new Date();
    if (!isEmergency) {
      appointmentDate.setDate(appointmentDate.getDate() + 1);
    } else {
      // For emergency cases, set to current date
      appointmentDate.setHours(appointmentDate.getHours() + 1); // Add 1 hour for immediate processing
    }

    // Create the appointment
    const appointment = await db.appointment.create({
      data: {
        patient_id: patientId,
        doctor_id: targetDoctorId,
        appointment_date: appointmentDate,
        time: appointmentDate.toTimeString().slice(0, 5), // HH:MM format
        status: AppointmentStatus.PENDING,
        type: isEmergency ? "EMERGENCY" : "REFERRAL",
        note: notes,
        reason: condition
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Appointment created successfully',
      appointment 
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}