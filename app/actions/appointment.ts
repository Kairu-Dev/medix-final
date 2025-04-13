"use server";

import { VitalSignsFormData } from "@/components/dialogs/add-vital-signs";
import db from "@/lib/db";
import { sendAppointmentEmail } from "@/lib/email-service";
import { AppointmentSchema, VitalSignsSchema } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { AppointmentStatus } from "@prisma/client";
/* eslint-disable */

export async function appointmentAction(
  id: string | number,
  status: AppointmentStatus,
  reason: string
) {
  try {
    // Update the appointment status in the database
    const updatedAppointment = await db.appointment.update({
      where: {
        id: Number(id),
      },
      data: {
        status,
        reason,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    // Check if the status is either SCHEDULED or CANCELLED to send email
    if (status === 'SCHEDULED' || status === 'CANCELLED') {
      // Get patient email
      const patientEmail = updatedAppointment.patient.email;
      
      // Prepare data for the email
      const emailData = {
        patientName: `${updatedAppointment.patient.first_name} ${updatedAppointment.patient.last_name}`,
        doctorName: updatedAppointment.doctor.name,
        appointmentDate: updatedAppointment.appointment_date,
        appointmentTime: updatedAppointment.time,
        appointmentType: updatedAppointment.type,
        reason: updatedAppointment.reason || undefined,
      };

      // Send the appropriate email based on the status
      await sendAppointmentEmail(
        patientEmail,
        status === 'SCHEDULED' ? 'SCHEDULED' : 'CANCELLED',
        emailData
      );
    }

    return {
      success: true,
      msg: `Appointment ${status.toLowerCase()} successfully.`,
    };
  } catch (error) {
    console.error("Error updating appointment:", error);
    return {
      success: false,
      error: true,
      msg: "Failed to update appointment status.",
    };
  }
}

export async function createNewAppointment(data: any) {
    try {
      const validatedData = AppointmentSchema.safeParse(data);
      
  
      if (!validatedData.success) {
        return { success: false, msg: "Invalid data" };
      }
      const validated = validatedData.data;
  
      await db.appointment.create({
        data: {
          patient_id: data.patient_id,
          doctor_id: validated.doctor_id,
          time: validated.time,
          type: validated.type,
          appointment_date: new Date(validated.appointment_date),
          note: validated.note,
        },
      });
  
      return {
        success: true,
        message: "Appointment booked successfully",
      };
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Internal Server Error" };
    }
  }

  export async function addVitalSigns(
    data: VitalSignsFormData,
    appointmentId: string,
    doctorId: string
  ) {
    try {
      const { userId } = await auth();
  
      if (!userId) {
        return { success: false, msg: "Unauthorized" };
      }
  
      const validatedData = VitalSignsSchema.parse(data);
  
      let medicalRecord = null;
  
      if (!validatedData.medical_id) {
        medicalRecord = await db.medicalRecords.create({
          data: {
            patient_id: validatedData.patient_id,
            appointment_id: Number(appointmentId),
            doctor_id: doctorId,
          },
        });
      }
  
      const med_id = validatedData.medical_id || medicalRecord?.id;
  
      await db.vitalSigns.create({
        data: {
          ...validatedData,
          medical_id: Number(med_id!),
        },
      });
  
      return {
        success: true,
        msg: "Vital signs added successfully",
      };
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Internal Server Error" };
    }
  }

