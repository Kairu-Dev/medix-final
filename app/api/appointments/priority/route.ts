import { NextRequest, NextResponse } from "next/server";


import { PriorityLevel } from "@prisma/client";
import { currentUser } from "@clerk/nextjs/server";
import db from "@/lib/db";
import { checkRole } from "@/utils/roles";
    /* eslint-disable */
export async function POST(request: NextRequest) {
    try {
      // Use currentUser instead of auth()
      const user = await currentUser();
      if (!user || !user.id) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }
  
      // Optional: Check if user has appropriate role
      const canAccessPatients = await checkRole("ADMIN");
      if (!canAccessPatients) {
        return NextResponse.json(
          { success: false, message: "Unauthorized - Insufficient permissions" },
          { status: 403 }
        );
      }

    const body = await request.json();
    const { 
      patientId, 
      condition, 
      appointmentType, 
      priorityScore, 
      priorityLevel, 
      notes, 
      manualOverride,
      appointmentId  // Optional: can link to an existing appointment
    } = body;

    // Validate required fields
    if (!patientId || priorityScore === undefined || !priorityLevel) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Normalize the priority level input
    const normalizedPriorityLevel = priorityLevel.toUpperCase() as PriorityLevel;
    if (!['NORMAL', 'URGENT', 'EMERGENCY'].includes(normalizedPriorityLevel)) {
      return NextResponse.json(
        { success: false, message: "Invalid priority level" },
        { status: 400 }
      );
    }

    let priorityAssessment;

    if (appointmentId) {
      // If appointmentId provided, update the appointment's priority and create/update assessment
      const appointment = await db.appointment.findUnique({
        where: { id: appointmentId }
      });

      if (!appointment) {
        return NextResponse.json(
          { success: false, message: "Appointment not found" },
          { status: 404 }
        );
      }

      // Update appointment with priority information
      await db.appointment.update({
        where: { id: appointmentId },
        data: {
          priority_level: normalizedPriorityLevel,
          priority_score: priorityScore,
          priority_override: manualOverride
        }
      });

      // Check if there's an existing priority assessment for this appointment
      const existingAssessment = await db.priorityAssessment.findUnique({
        where: { appointment_id: appointmentId }
      });

      if (existingAssessment) {
        // Update existing assessment
        priorityAssessment = await db.priorityAssessment.update({
          where: { id: existingAssessment.id },
          data: {
            condition,
            appointment_type: appointmentType,
            priority_score: priorityScore,
            priority_level: normalizedPriorityLevel,
            notes,
            manual_override: manualOverride
          }
        });
      } else {
        // Create new assessment linked to appointment
        priorityAssessment = await db.priorityAssessment.create({
          data: {
            appointment_id: appointmentId,
            patient_id: patientId,
            condition: condition || "",
            appointment_type: appointmentType || "General",
            priority_score: priorityScore,
            priority_level: normalizedPriorityLevel,
            notes,
            manual_override: manualOverride
          }
        });
      }
    } else {
      // Create a new appointment entry with priority information
      const appointment = await db.appointment.create({
        data: {
          patient_id: patientId,
          doctor_id: "placeholder", // This will need to be updated later
          appointment_date: new Date(),
          time: "00:00",
          type: appointmentType || "General",
          status: "PENDING",
          priority_level: normalizedPriorityLevel,
          priority_score: priorityScore,
          priority_override: manualOverride
        }
      });

      // Create new assessment linked to the new appointment
      priorityAssessment = await db.priorityAssessment.create({
        data: {
          appointment_id: appointment.id,
          patient_id: patientId,
          condition: condition || "",
          appointment_type: appointmentType || "General",
          priority_score: priorityScore,
          priority_level: normalizedPriorityLevel,
          notes,
          manual_override: manualOverride
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Priority assessment created", 
      data: priorityAssessment 
    });

  } catch (error: any) {
    console.error("Error creating priority assessment:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve priority assessments for a patient
export async function GET(request: NextRequest) {
    try {
        // Use currentUser instead of auth()
        const user = await currentUser();
        if (!user || !user.id) {
          return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
        }

    const url = new URL(request.url);
    const patientId = url.searchParams.get("patientId");
    const appointmentId = url.searchParams.get("appointmentId");

    if (!patientId && !appointmentId) {
      return NextResponse.json(
        { success: false, message: "Patient ID or Appointment ID required" },
        { status: 400 }
      );
    }

    let query: any = {};
    
    if (patientId) {
      query.patient_id = patientId;
    }
    
    if (appointmentId) {
      query.appointment_id = parseInt(appointmentId);
    }

    const priorityAssessments = await db.priorityAssessment.findMany({
      where: query,
      orderBy: {
        created_at: "desc"
      },
      include: {
        appointment: {
          select: {
            type: true,
            status: true,
            appointment_date: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: priorityAssessments 
    });

  } catch (error: any) {
    console.error("Error fetching priority assessments:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}