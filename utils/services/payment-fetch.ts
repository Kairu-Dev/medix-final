import db from '@/lib/db';

/**
 * Retrieves payment records with pagination and search functionality
 * @param options - Options for pagination and search
 * @returns Payment records with pagination metadata
 */
export async function getPaymentRecords({
  page = "1",
  search = "",
  limit = "10"
}: {
  page?: string;
  search?: string;
  limit?: string;
}) {
  try {
    const currentPage = parseInt(page);
    const dataLimit = parseInt(limit);
    const skip = (currentPage - 1) * dataLimit;

    // Create base query
    const baseQuery = {
      where: {},
      include: {
        patient: true
      },
      orderBy: {
        created_at: 'desc' as const
      }
    };

    // Add search if provided
    if (search) {
      baseQuery.where = {
        OR: [
          {
            patient: {
              OR: [
                { first_name: { contains: search, mode: 'insensitive' } },
                { last_name: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } }
              ]
            }
          },
          { receipt_number: parseInt(search) || undefined }
        ]
      };
    }

    // Get count of all records matching search
    const totalRecords = await db.payment.count({
      where: baseQuery.where
    });

    // Get paginated data
    const data = await db.payment.findMany({
      ...baseQuery,
      skip,
      take: dataLimit
    });

    const totalPages = Math.ceil(totalRecords / dataLimit);

    return {
      data,
      totalPages,
      totalRecords,
      currentPage
    };
  } catch (error) {
    console.error("Error fetching payment records:", error);
    return {
      data: [],
      totalPages: 0,
      totalRecords: 0,
      currentPage: 1
    };
  }
}

/**
 * Gets a single payment record by ID
 * @param id - Payment ID
 * @returns Payment record with related data
 */
export async function getPaymentById(id: string) {
  try {
    const paymentId = parseInt(id);
    
    if (isNaN(paymentId)) {
      return {
        success: false,
        message: "Invalid payment ID",
        status: 400,
        data: null,
      };
    }
    
    const payment = await db.payment.findUnique({
      where: { id: paymentId },
      include: {
        patient: true,
        appointment: true,
        bills: {
          include: {
            service: true, // Include the service relation to get service name
          }
        },
      },
    });
    
    if (!payment) {
      return {
        success: false,
        message: "Payment record not found",
        status: 404,
        data: null,
      };
    }
    
    return { 
      success: true, 
      data: payment, 
      status: 200 
    };
  } catch (error) {
    console.error("Error fetching payment details:", error);
    return { 
      success: false, 
      message: "Internal Server Error", 
      status: 500 
    };
  }
}

/**
 * Gets a payment record by appointment ID
 * @param appointmentId - Appointment ID
 * @returns Payment record with related data
 */
export async function getPaymentByAppointmentId(appointmentId: string) {
  try {
    const appId = parseInt(appointmentId);
    
    if (isNaN(appId)) {
      return {
        success: false,
        message: "Invalid appointment ID",
        status: 400,
        data: null,
      };
    }
    
    const payment = await db.payment.findUnique({
      where: { appointment_id: appId },
      include: {
        patient: true,
        appointment: true,
        bills: {
          include: {
            service: true, // Include the service relation to get service name
          }
        },
      },
    });
    
    if (!payment) {
      return {
        success: false,
        message: "Payment record not found for this appointment",
        status: 404,
        data: null,
      };
    }
    
    return { 
      success: true, 
      data: payment, 
      status: 200 
    };
  } catch (error) {
    console.error("Error fetching payment by appointment ID:", error);
    return { 
      success: false, 
      message: "Internal Server Error", 
      status: 500 
    };
  }
}