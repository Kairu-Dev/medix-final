"use server";

import db from "@/lib/db";
import { sendDoctorWelcomeEmail, sendStaffWelcomeEmail } from "@/lib/email-service";
import { DoctorSchema, ServicesSchema, StaffSchema, WorkingDaysSchema } from "@/lib/validation";
import { generateRandomColor } from "@/utils";
import { checkRole } from "@/utils/roles";
import { auth, clerkClient } from "@clerk/nextjs/server";
/* eslint-disable */

export async function createNewDoctor(data: any) {

    try {

        const values = DoctorSchema.safeParse(data);

        const workingDaysValues = WorkingDaysSchema.safeParse(data?.work_schedule);

        if(!values.success || !workingDaysValues.success) {

            return {
                success: false, 
                errors: true, 
                message: "Provide all Required Information",
            };
        }

        const validatedValues = values.data;

        const workingDayData = workingDaysValues.data!;
        
        const client = await clerkClient();



        const user = await client.users.createUser({
      emailAddress: [validatedValues.email],
      password: validatedValues.password,
      firstName: validatedValues.name.split(" ")[0],
      lastName: validatedValues.name.split(" ")[1],
      publicMetadata: { role: "doctor" },
          });
          

        delete validatedValues["password"];

        const doctor = await db.doctor.create({
            data: {
                ...validatedValues, 
                id:user.id,
            },
        });

        await Promise.all(
            workingDayData?.map((el) => 
                db.workingDays.create({
                    data: { ...el, doctor_id: doctor.id },
                })
            )
        );

        return {
            success: true, 
            message: "Doctor has been added successfully", 
            error: false,
        };
        
    } catch (error) {

        console.log(error);
        return {error: true, success: false, message: "Something went wrong"};
        
    }

} 

export async function createNewStaff(data: any) {
  try {
    console.log("Create staff started with data:", JSON.stringify(data, null, 2));
    
    const { userId } = await auth();
    if (!userId) {
      return { success: false, msg: "Unauthorized" };
    }

    const isAdmin = await checkRole("ADMIN");
    if (!isAdmin) {
      return { success: false, msg: "Unauthorized" };
    }

    const values = StaffSchema.safeParse(data);
    if (!values.success) {
      console.log("Validation failed:", values.error);
      return {
        success: false,
        errors: true,
        message: "Please provide all required info",
      };
    }

    const validatedValues = values.data;
    console.log("Validated values:", JSON.stringify(validatedValues, null, 2));

    // Store the plain password for email before we delete it
    const plainPassword = validatedValues.password;

    try {
      const client = await clerkClient();
      console.log("About to create Clerk user");
      
      const user = await client.users.createUser({
        emailAddress: [validatedValues.email],
        password: validatedValues.password,
        firstName: validatedValues.name.split(" ")[0],
        lastName: validatedValues.name.split(" ")[1],
        publicMetadata: { role: validatedValues.role.toLowerCase() }, // Keep original for now
      });
      
      console.log("Clerk user created successfully:", user.id);
      
      // Remove password from validated values for database storage
      delete validatedValues["password"];
      
      const staff = await db.staff.create({
        data: {
          name: validatedValues.name,
          phone: validatedValues.phone,
          email: validatedValues.email,
          address: validatedValues.address,
          role: validatedValues.role,
          license_number: validatedValues.license_number,
          department: validatedValues.department,
          colorCode: generateRandomColor(),
          id: user.id,
          status: "ACTIVE",
        },
      });
      
      console.log("Staff created in database");

      // Get admin information for the email
      const currentUser = await client.users.getUser(userId);
      let adminName = "System Administrator";
      
      if (currentUser.firstName || currentUser.lastName) {
        // If we have at least one name component
        const firstName = currentUser.firstName || "";
        const lastName = currentUser.lastName || "";
        adminName = `${firstName} ${lastName}`.trim();
      } else if (currentUser.fullName) {
        // Try fullName as fallback
        adminName = currentUser.fullName;
      }
      // If no names are available, keep "System Administrator" as default

      // Send welcome email to the new staff member
      console.log("Sending welcome email to staff...");
      try {
        const emailResult = await sendWelcomeStaffEmailAction(
          validatedValues.email,
          {
            staffName: validatedValues.name,
            staffEmail: validatedValues.email,
            password: plainPassword || "", // Ensure password is always a string
            adminName: adminName,
            role: validatedValues.role,
            department: validatedValues.department || '',
            licenseNumber: validatedValues.license_number || '',
            phone: validatedValues.phone,
            address: validatedValues.address,
          }
        );

        if (emailResult.success) {
          console.log("Welcome email sent successfully to staff");
        } else {
          console.warn("Failed to send welcome email to staff:", emailResult.error);
          // Don't fail the entire operation if email fails
        }
      } catch (emailError) {
        console.error("Error sending welcome email to staff:", emailError);
        // Continue with success even if email fails
      }
      
      return {
        success: true,
        message: "Staff added successfully",
        error: false,
      };
    } catch (error) {
      console.error("Clerk error:", error);
      // Add type guard for error
      if (error && typeof error === 'object' && 'errors' in error) {
        console.error("Clerk error details:", JSON.stringify(error.errors, null, 2));
      }
      return { error: true, success: false, message: "Failed to create user in authentication system. Check if User is Already Registed as a Staff in Clerk. No Duplicate Emails Allowed" };
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return { error: true, success: false, message: "Something went wrong" };
  }
}

  export async function addNewService(data: any) {
    try {
      const isValidData = ServicesSchema.safeParse(data);
  
      const validatedData = isValidData.data;
  
      await db.services.create({
        data: { ...validatedData!, price: Number(data.price!) },
      });
  
      return {
        success: true,
        error: false,
        msg: `Service added successfully`,
      };
    } catch (error) {
      console.log(error);
      return { success: false, msg: "Internal Server Error" };
    }
  }


export async function sendWelcomeDoctorEmailAction(
  email: string,
  doctorData: {
    doctorName: string;
    doctorEmail: string;
    password: string;
    adminName: string;
    specialization: string;
    department: string;
    licenseNumber: string;
    workSchedule: Array<{
      day: string;
      start_time?: string;
      close_time?: string;
    }>;
  }
) {
  try {
    const result = await sendDoctorWelcomeEmail(email, doctorData);
    return result;
  } catch (error) {
    console.error("Failed to send doctor welcome email:", error);
    return { success: false, error: "Failed to send welcome email" };
  }
}

export async function sendWelcomeStaffEmailAction(
  email: string,
  staffData: {
    staffName: string;
    staffEmail: string;
    password: string;
    adminName: string;
    role: string;
    department?: string;
    licenseNumber?: string;
    phone: string;
    address: string;
  }
) {
  try {
    const result = await sendStaffWelcomeEmail(email, staffData);
    return result;
  } catch (error) {
    console.error("Failed to send staff welcome email:", error);
    return { success: false, error: "Failed to send welcome email" };
  }
}