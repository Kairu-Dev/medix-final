"use server";

import db from "@/lib/db";
import { PatientFormSchema } from "@/lib/validation";
import { clerkClient } from "@clerk/nextjs/server";
/* eslint-disable */

export async function updatePatient(data: any, pid: string) {
  try {
    const validateData = PatientFormSchema.safeParse(data);
    

    if (!validateData.success) {
      return {
        success: false,
        error: true,
        msg: "Provide all required fields",
      };
    }

    const patientData = validateData.data;

    const client = await clerkClient();
    await client.users.updateUser(pid, {
      firstName: patientData.first_name,
      lastName: patientData.last_name,
    });

    await db.patient.update({
      data: {
        ...patientData,
      },
      where: { id: pid },
    });

    return {
      success: true,
      error: false,
      msg: "Patient info updated successfully",
    };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: true, msg: error?.message };
  }
}
export async function createNewPatient(data: any, pid: string) {
  try {
    const validateData = PatientFormSchema.safeParse(data);

    if (!validateData.success) {
      return {
        success: false,
        error: true,
        msg: "Provide all required fields",
      };
    }

    const patientData = validateData.data;
    let patient_id = pid;

    // Check if patient with this email already exists
    const existingPatient = await db.patient.findUnique({
      where: { email: patientData.email }
    });

    if (existingPatient) {
      // If patient exists, update instead of create
      await db.patient.update({
        where: { email: patientData.email },
        data: {
          ...patientData,
          id: patient_id, // Update the id to current user's id if needed
        },
      });

      const client = await clerkClient();
      await client.users.updateUser(pid, {
        publicMetadata: { role: "patient" },
      });

      return { 
        success: true, 
        error: false, 
        msg: "Patient information updated successfully" 
      };
    }

    const client = await clerkClient();
    if (pid === "new-patient") {
      const user = await client.users.createUser({
        emailAddress: [patientData.email],
        password: patientData.phone,
        firstName: patientData.first_name,
        lastName: patientData.last_name,
        publicMetadata: { role: "patient" },
      });

      patient_id = user?.id;
    } else {
      await client.users.updateUser(pid, {
        publicMetadata: { role: "patient" },
      });
    }

    // Create new patient since none exists with this email
    await db.patient.create({
      data: {
        ...patientData,
        id: patient_id,
      },
    });

    return { success: true, error: false, msg: "Patient created successfully" };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: true, msg: error?.message };
  }
}