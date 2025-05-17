'use server';

import db from "@/lib/db";
import { ReferralStatus, ReferralUrgency } from "@prisma/client";

/**
 * Fetches all available departments
 */
export async function getDepartments() {
  try {
    // Normally this would fetch from a departments table
    // For now, we'll return hard-coded departments
    const departments = [
      { label: "Cardiology", value: "cardiology" },
      { label: "Neurology", value: "neurology" },
      { label: "Orthopedics", value: "orthopedics" },
      { label: "Pediatrics", value: "pediatrics" },
      { label: "Radiology", value: "radiology" },
      { label: "Oncology", value: "oncology" },
      { label: "Dermatology", value: "dermatology" },
      { label: "General Surgery", value: "general_surgery" },
    ];
    
    return { success: true, data: departments, status: 200 };
  } catch (error) {
    console.error("Error fetching departments:", error);
    return { success: false, message: "Failed to fetch departments", status: 500 };
  }
}

/**
 * Fetches patient data by ID
 */
export async function getPatientById(id: string) {
    try {
      // Check if id is provided
      if (!id) {
        console.error("No patient ID provided");
        return { success: false, message: "Patient ID is required", status: 400 };
      }
      
      // Ensure id is a non-empty string
      if (typeof id !== 'string' || id.trim() === '') {
        console.error("Invalid patient ID format:", id);
        return { success: false, message: "Invalid patient ID format", status: 400 };
      }
  
      const patient = await db.patient.findUnique({
        where: { id: id.trim() }
      });
      
      if (!patient) {
        return { success: false, message: "Patient not found", status: 404 };
      }
      
      return { success: true, data: patient, status: 200 };
    } catch (error) {
      console.error("Error fetching patient:", error);
      return { success: false, message: "Failed to fetch patient data", status: 500 };
    }
  }

/**
 * Fetches doctor data by ID
 */
export async function getDoctorById(id: string) {
  try {
    const doctor = await db.doctor.findUnique({
      where: { id }
    });
    
    if (!doctor) {
      return { success: false, message: "Doctor not found", status: 404 };
    }
    
    return { success: true, data: doctor, status: 200 };
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return { success: false, message: "Failed to fetch doctor data", status: 500 };
  }
}

/**
 * Fetches all doctors
 */
export async function getAllDoctors() {
  try {
    const doctors = await db.doctor.findMany();
    return { success: true, data: doctors, status: 200 };
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return { success: false, message: "Failed to fetch doctors", status: 500 };
  }
}

/**
 * Creates a new referral
 */
export async function createReferral(referralData: any) {
  try {
    // Validate required fields
    if (!referralData.patient_id || 
        !referralData.referring_doctor_id || 
        !referralData.referred_department || 
        !referralData.referral_type || 
        !referralData.reason_for_referral) {
      return { 
        success: false, 
        message: "Missing required fields for referral", 
        status: 400 
      };
    }

    // Prepare data for database
    const data = {
      referral_number: referralData.referral_number,
      patient_id: referralData.patient_id,
      referring_doctor_id: referralData.referring_doctor_id,
      referred_to_doctor_id: referralData.referred_to_doctor_id,
      referred_department: referralData.referred_department,
      referral_type: referralData.referral_type,
      reason_for_referral: referralData.reason_for_referral,
      status: referralData.status || ReferralStatus.PENDING,
      urgency: referralData.urgency || ReferralUrgency.ROUTINE,
      created_at: new Date(),
      external_doctor_name: referralData.external_doctor_name,
      external_facility: referralData.external_facility,
      external_contact: referralData.external_contact,
      diagnosis: referralData.diagnosis,
      symptoms: referralData.symptoms,
      clinical_notes: referralData.clinical_notes,
      medical_history: referralData.medical_history,
      current_medications: referralData.current_medications,
      allergies: referralData.allergies,
      test_results: referralData.test_results,
      follow_up_instructions: referralData.follow_up_instructions,
      follow_up_date: referralData.follow_up_date ? new Date(referralData.follow_up_date) : undefined,
      insurance_details: referralData.insurance_details,
      authorization_number: referralData.authorization_number,
      special_instructions: referralData.special_instructions
    };

    // Create the referral in the database
    const referral = await db.referral.create({
      data
    });

    return { success: true, data: referral, status: 201 };
  } catch (error) {
    console.error("Error creating referral:", error);
    return { success: false, message: "Failed to create referral", status: 500 };
  }
}

/**
 * Get referrals for a specific patient
 */
export async function getPatientReferrals(patientId: string) {
  try {
    const referrals = await db.referral.findMany({
      where: { patient_id: patientId },
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            gender: true,
            img: true,
            colorCode: true
          }
        },
        referring_doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            img: true,
            colorCode: true
          }
        },
        referred_to_doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            img: true,
            colorCode: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return { success: true, data: referrals, status: 200 };
  } catch (error) {
    console.error("Error fetching patient referrals:", error);
    return { success: false, message: "Failed to fetch patient referrals", status: 500 };
  }
}

/**
 * Get referrals for a specific doctor (either as the referring doctor or the referred doctor)
 */
export async function getDoctorReferrals(doctorId: string) {
  try {
    const referrals = await db.referral.findMany({
      where: {
        OR: [
          { referring_doctor_id: doctorId },
          { referred_to_doctor_id: doctorId }
        ]
      },
      include: {
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            gender: true,
            img: true,
            colorCode: true
          }
        },
        referring_doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            img: true,
            colorCode: true
          }
        },
        referred_to_doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
            img: true,
            colorCode: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return { success: true, data: referrals, status: 200 };
  } catch (error) {
    console.error("Error fetching doctor referrals:", error);
    return { success: false, message: "Failed to fetch doctor referrals", status: 500 };
  }
}

/**
 * Update a referral status
 */
export async function updateReferralStatus(referralId: string, status: ReferralStatus) {
  try {
    const updatedReferral = await db.referral.update({
      where: { id: Number(referralId) },
      data: { 
        status,
        updated_at: new Date()
      }
    });

    return { success: true, data: updatedReferral, status: 200 };
  } catch (error) {
    console.error("Error updating referral status:", error);
    return { success: false, message: "Failed to update referral status", status: 500 };
  }
}

/**
 * Get a single referral by ID with all details
 */
export async function getReferralById(referralId: string) {
  try {
    const referral = await db.referral.findUnique({
      where: { id: Number(referralId) },
      include: {
        patient: true,
        referring_doctor: true,
        referred_to_doctor: true
      }
    });

    if (!referral) {
      return { success: false, message: "Referral not found", status: 404 };
    }

    return { success: true, data: referral, status: 200 };
  } catch (error) {
    console.error("Error fetching referral:", error);
    return { success: false, message: "Failed to fetch referral", status: 500 };
  }
}