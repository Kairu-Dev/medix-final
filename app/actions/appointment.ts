"use server";

import { VitalSignsFormData } from "@/components/dialogs/add-vital-signs";
import db from "@/lib/db";
import { AppointmentSchema, ReferralSchema, VitalSignsSchema } from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { AppointmentStatus, ReferralStatus, ReferralUrgency } from "@prisma/client";
import { revalidatePath } from "next/cache";

/* eslint-disable */

type AppointmentWithRelations = {
  id: string | number;
  status: AppointmentStatus;
  appointment_date: Date;
  time: string;
  type: string;
  patient: {
    email: string;
    first_name: string;
    last_name: string;
  };
  doctor: {
    name: string;
  };
  // Add other properties as needed
};

// Define the return type for your appointment action
type AppointmentActionResponse = 
  | { 
      success: true; 
      msg: string; 
      appointment: AppointmentWithRelations;
    }
  | {
      error: any; 
      success: false; 
      msg: string; 
    };

// Updated appointment action that handles ALL email sending on the server
import { sendAppointmentEmail } from "@/lib/email-service";

export async function appointmentAction(
  id: string | number,
  status: AppointmentStatus,
  reason: string
): Promise<AppointmentActionResponse> {
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

    // Send emails for all status changes (SCHEDULED, CANCELLED, COMPLETED)
    if (status === 'SCHEDULED' || status === 'CANCELLED' || status === 'COMPLETED') {
      try {
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
          status, // This will be 'SCHEDULED', 'CANCELLED', or 'COMPLETED'
          emailData
        );
        
        console.log(`${status} email sent successfully to ${patientEmail}`);
      } catch (emailError) {
        console.error(`Failed to send ${status} email:`, emailError);
        // Don't fail the entire operation if email fails
      }
    }

    return {
      success: true,
      msg: `Appointment ${status.toLowerCase()} successfully.`,
      appointment: updatedAppointment
    };
    
  } catch (error) {
    console.error("Error updating appointment:", error);
    return {
      success: false,
      msg: "Failed to update appointment status.",
      error: error
    };
  }
}

export async function createNewAppointment(data: any) {
  try {
    // First validate the basic appointment data
    const validatedData = AppointmentSchema.safeParse(data);
    
    if (!validatedData.success) {
      return { success: false, msg: "Invalid data" };
    }
    
    const validated = validatedData.data;
    
    // Create the appointment with all required fields including priority-related data
    const appointment = await db.appointment.create({
      data: {
        patient_id: data.patient_id,
        doctor_id: validated.doctor_id,
        time: validated.time,
        type: validated.type,
        appointment_date: new Date(validated.appointment_date),
        note: validated.note,
        // Include priority data from EnhancedBookAppointment component
        priority_level: data.priority_level || 'NORMAL',
        priority_score: data.priority_score || 0,
        priority_override: data.priority_override || false,
        booked_by: data.booked_by, // Add this line
        // Create the related priority assessment if provided
        ...(data.priorityAssessment && {
          priorityAssessment: data.priorityAssessment
        })
      },
    });

    return {
      success: true,
      message: "Appointment booked successfully",
      appointment: appointment,
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

{/*}
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
  */}

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



export async function createNewReferral(formData: any) {
  try {
    // Validate form data
    const validatedFields = ReferralSchema.safeParse(formData);
    
    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validatedFields.error.flatten().fieldErrors
      };
    }

    const data = validatedFields.data;
    
    // Create new referral in database
    const referral = await db.referral.create({
      data: {
        referral_number: data.referral_number,
        
        // Patient information
        patient: {
          connect: { id: formData.patient_id }
        },
        
        // Referral source
        referring_doctor: {
          connect: { id: data.referring_doctor_id }
        },
        
        // Referral destination - either internal or external
        ...(data.referred_to_doctor_id ? {
          referred_to_doctor: {
            connect: { id: data.referred_to_doctor_id }
          }
        } : {}),
        
        // External doctor info if applicable
        external_doctor_name: data.external_doctor_name,
        external_facility: data.external_facility,
        external_contact: data.external_contact,
        
        // Referral details
        referred_department: data.referred_department,
        referral_type: data.referral_type,
        
        // Clinical information
        reason_for_referral: data.reason_for_referral,
        diagnosis: data.diagnosis,
        symptoms: data.symptoms,
        clinical_notes: data.clinical_notes,
        medical_history: data.medical_history,
        current_medications: data.current_medications,
        allergies: data.allergies,
        test_results: data.test_results,
        
        // Status tracking
        status: data.status as ReferralStatus,
        urgency: data.urgency as ReferralUrgency,
        priority_level: data.priority_level,
        
        // Follow-up information
        follow_up_instructions: data.follow_up_instructions,
        follow_up_date: data.follow_up_date ? new Date(data.follow_up_date) : null,
        
        // Administrative
        insurance_details: data.insurance_details,
        authorization_number: data.authorization_number,
        special_instructions: data.special_instructions,
      }
    });

    // If there's a related medical record, update it
    if (formData.related_medical_record_id) {
      await db.referral.update({
        where: { id: referral.id },
        data: {
          related_medical_record: {
            connect: { id: parseInt(formData.related_medical_record_id) }
          }
        }
      });
    }

    // Revalidate the path to reflect changes immediately
    revalidatePath("/dashboard/patients/[patientId]", "page");
    revalidatePath("/dashboard/referrals");
    
    return {
      success: true,
      message: "Referral created successfully",
      referral
    };
  } catch (error) {
    console.error("Error creating referral:", error);
    return {
      success: false,
      message: "Failed to create referral"
    };
  }
}

export async function updateReferralStatus(referralId: number, status: ReferralStatus, feedbackOrNotes?: string) {
  try {
    const updatedReferral = await db.referral.update({
      where: { id: referralId },
      data: {
        status,
        ...(status === ReferralStatus.COMPLETED && { completed_at: new Date() }),
        ...(feedbackOrNotes && { 
          receiving_doctor_feedback: feedbackOrNotes,
          feedback_date: new Date()
        })
      }
    });

    // Revalidate relevant paths
    revalidatePath("/dashboard/patients/[patientId]", "page");
    revalidatePath("/dashboard/referrals");
    
    return {
      success: true,
      message: `Referral status updated to ${status}`,
      referral: updatedReferral
    };
  } catch (error) {
    console.error("Error updating referral status:", error);
    return {
      success: false,
      message: "Failed to update referral status"
    };
  }
}
