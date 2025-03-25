"use server";


import db from "@/lib/db";
import { clerkClient } from "@clerk/nextjs/server";


export async function deleteDataById(
  id: string,

  deleteType: "doctor" | "staff" | "patient" | "payment"
) {
  try {
    switch (deleteType) {
      case "doctor":
        await db.doctor.delete({ where: { id: id } });
      case "staff":
        await db.staff.delete({ where: {id: id } });
      case "patient":
        await db.patient.delete({ where: {id: id } });
      case "payment":
        await db.payment.delete({ where: {id: Number(id) } });
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
 