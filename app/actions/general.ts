"use server";



import { ReviewFormValues } from "@/components/dialogs/review-form";
import db from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";


export async function deleteDataById(
  id: string,
  deleteType: "doctor" | "staff" | "patient" | "payment" | "bill" | "auditLog"
) {
  try {
    switch (deleteType) {
      case "doctor":
        await db.doctor.delete({ where: { id: id } });
        break;
      case "staff":
        await db.staff.delete({ where: {id: id } });
        break;
      case "patient":
        await db.patient.delete({ where: {id: id } });
        break;
      case "payment":
        await db.payment.delete({ where: {id: Number(id) } });
        break;
      case "bill":
        // Delete the bill first
        await db.patientBills.delete({ where: {id: Number(id) } });
        
        // After deletion, we need to recalculate the payment totals
        // But instead of trying to access the payment directly from the bill (which causes type errors),
        // we'll update all payment records that may have been affected
        
        // Find all payments with bills
        const paymentsWithBills = await db.payment.findMany({
          include: {
            bills: true
          }
        });
        
        // Update each payment with the correct totals based on remaining bills
        for (const payment of paymentsWithBills) {
          // Calculate new total from the remaining bills
          const newTotalBills = payment.bills.reduce(
            (sum, bill) => sum + bill.total_cost, 
            0
          );
          
          // Calculate new discount amount
          let newDiscountAmount = 0;
          if (payment.total_amount > 0) {
            const discountPercentage = payment.discount 
              ? (payment.discount / payment.total_amount) * 100 
              : 0;
            
            newDiscountAmount = (newTotalBills * discountPercentage) / 100;
          }
          
          // Update the payment record with new calculations
          await db.payment.update({
            where: { id: payment.id },
            data: {
              total_amount: newTotalBills,
              discount: newDiscountAmount,
              // Ensure amount_paid doesn't exceed the new total
              amount_paid: Math.min(payment.amount_paid, newTotalBills - newDiscountAmount)
            }
          });
        }
        break;
      case "auditLog":
        await db.services.delete({ where: {id: Number(id) } });
        break;
    }

    if (
      deleteType === "staff" ||
      deleteType === "patient" ||
      deleteType === "doctor"
    ) {
      const client = await clerkClient();
      await client.users.deleteUser(id);
    }

    return {
      success: true,
      message: "Data deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}

export async function createReview(values: ReviewFormValues) {
  try {
    // Create a local validation schema
    const localReviewSchema = z.object({
      patient_id: z.string(),
      staff_id: z.string(),
      rating: z.number().min(1).max(5),
      comment: z
        .string()
        .min(1, "Review must be at least 10 characters long")
        .max(500, "Review must not exceed 500 characters"),
    });
    
    // Validate using the local schema
    const validationResult = localReviewSchema.safeParse(values);
    
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten(),
        status: 400,
      };
    }
    
    await db.rating.create({
      data: {
        ...validationResult.data,
      },
    });

    return {
      success: true,
      message: "Review created successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}


