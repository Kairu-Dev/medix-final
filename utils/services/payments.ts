import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import { DATA_LIMIT } from "../setting";

export async function getPaymentRecords({
  page,
  limit,
  search,
}: {
  page: number | string;
  limit?: number | string;
  search?: string;
}) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;

    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    const where: Prisma.PaymentWhereInput = {
      OR: [
        {
          patient: {
            first_name: { contains: search, mode: "insensitive" },
          },
        },
        {
          patient: {
            last_name: { contains: search, mode: "insensitive" },
          },
        },
        { patient_id: { contains: search, mode: "insensitive" } },
      ],
    };

    const [data, totalRecords] = await Promise.all([
      db.payment.findMany({
        where: where,
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true,
              date_of_birth: true,
              img: true,
              colorCode: true,
              gender: true,
              phone: true,
           
              
            },
          },
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: { created_at: "desc" },
      }),
      db.payment.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT);

    return {
      success: true,
      data,
      totalRecords,
      totalPages,
      currentPage: PAGE_NUMBER,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

// Add this function to your utils/services/payments.ts file

// Add this function to your utils/services/payments.ts file

interface GetPatientPaymentRecordsProps {
  page: string;
  search: string;
  patientId: string; // The patient's clerk user ID
}

export const getPatientPaymentRecords = async ({ 
  page, 
  search, 
  patientId 
}: GetPatientPaymentRecordsProps) => {
  try {
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * DATA_LIMIT;

    // Build the where clause for patient-specific filtering
    const whereClause = {
      patient_id: patientId, // Filter by the specific patient ID
      AND: search
        ? {
            OR: [
              {
                patient: {
                  first_name: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              },
              {
                patient: {
                  last_name: {
                    contains: search,
                    mode: 'insensitive' as const,
                  },
                },
              },
              {
                status: search as Prisma.EnumPaymentStatusFilter,
              },
            ],
          }
        : undefined,
    };

    // Get total count for pagination
    const totalRecords = await db.payment.count({
      where: whereClause,
    });

    // Get the payment records with patient information
    const payments = await db.payment.findMany({
      where: whereClause,
      include: {
        patient: true,
        appointment: true,
      },
      orderBy: {
        bill_date: 'desc', // Show most recent bills first
      },
      skip,
      take: DATA_LIMIT,
    });

    const totalPages = Math.ceil(totalRecords / DATA_LIMIT);

    return {
      data: payments,
      totalPages,
      totalRecords,
      currentPage,
    };
  } catch (error) {
    console.error('Error fetching patient payment records:', error);
    return {
      data: [],
      totalPages: 0,
      totalRecords: 0,
      currentPage: 1,
    };
  }
};