import db from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getAppointmentById(id: number) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Appointment id does not exist.",
        status: 404,
      };
    }

    const data = await db.appointment.findUnique({
      where: { id },
      include: {
        doctor: {
          select: { 
            id: true, 
            name: true, 
            specialization: true, 
            img: true,
            department: true,
            phone: true, // Add doctor's phone
            license_number: true, // Add license number
            availability_status: true, // Add availability status
            working_days: {
              select: {
                day: true,
                start_time: true,
                close_time: true
              }
            }
          },
        },
        patient: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            date_of_birth: true,
            gender: true,
            img: true,
            address: true,
            phone: true,
            email: true,
          },
        },
        bookedByStaff: {
          select: {
            id: true,
            name: true,
            img: true,
            role: true,
            department: true
          }
        },
        priorityAssessment: {
          select: {
            id: true,
            priority_score: true,
            priority_level: true,
            notes: true,
            condition: true,
            appointment_type: true
          }
        }
      },
    });

    if (!data) {
      return {
        success: false,
        message: "Appointment data not found",
        status: 200,
        data: null,
      };
    }

    return { success: true, data, status: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}


// Updated interface to include filters
// Updated appointment service function with enhanced filtering

interface AllAppointmentsProps {
  page: string;
  limit?: number;
  search?: string;
  id?: string;
  filters?: {
    status?: string;
    priority?: string;
    date?: string;
    time?: string;
    type?: string;
    from?: string;
    doctor?: string;
  };
}

const buildQuery = (id?: string, search?: string, filters?: AllAppointmentsProps['filters']) => {
  const conditions: Prisma.AppointmentWhereInput[] = [];

  // Base search conditions (general search across patient/doctor names)
  if (search) {
    conditions.push({
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
        {
          doctor: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ],
    });
  }

  // ID filtering conditions
  if (id) {
    conditions.push({
      OR: [{ patient_id: id }, { doctor_id: id }],
    });
  }

  // Advanced filter conditions
  if (filters) {
    // Status filter
    if (filters.status) {
      conditions.push({
        status: filters.status as any, // Cast to your status enum type
      });
    }

    // Priority filter
    if (filters.priority) {
      conditions.push({
        priority_level: filters.priority as any, // Cast to PriorityLevel enum
      });
    }

    // Date filter
    if (filters.date) {
      const filterDate = new Date(filters.date);
      const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
      
      conditions.push({
        appointment_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      });
    }

    // Time filter
// Time filter - Enhanced to handle different time formats
if (filters.time) {
  // Handle both 12-hour and 24-hour formats
  const timeQuery = filters.time.toLowerCase();
  
  // Create multiple search patterns for better matching
  const timePatterns = [];
  
  // If it's a 12-hour format (contains AM/PM)
  if (timeQuery.includes('am') || timeQuery.includes('pm')) {
    timePatterns.push(timeQuery);
    // Also try without spaces
    timePatterns.push(timeQuery.replace(/\s+/g, ''));
  } else {
    // If it's 24-hour format, try to convert to 12-hour
    const time24Match = timeQuery.match(/^(\d{1,2}):(\d{2})$/);
    if (time24Match) {
      const hour = parseInt(time24Match[1]);
      const minute = time24Match[2];
      
      if (hour === 0) {
        timePatterns.push(`12:${minute} am`);
        timePatterns.push(`12:${minute}am`);
      } else if (hour === 12) {
        timePatterns.push(`12:${minute} pm`);
        timePatterns.push(`12:${minute}pm`);
      } else if (hour < 12) {
        timePatterns.push(`${hour}:${minute} am`);
        timePatterns.push(`${hour}:${minute}am`);
      } else {
        const hour12 = hour - 12;
        timePatterns.push(`${hour12}:${minute} pm`);
        timePatterns.push(`${hour12}:${minute}pm`);
      }
    }
    
    // Also add the original query
    timePatterns.push(timeQuery);
  }
  
  conditions.push({
    OR: timePatterns.map(pattern => ({
      time: { contains: pattern, mode: "insensitive" }
    }))
  });
}

    // Type filter
    if (filters.type) {
      conditions.push({
        type: { contains: filters.type, mode: "insensitive" },
      });
    }

    // Specific patient name filter (from advanced search)
    if (filters.from) {
      conditions.push({
        OR: [
          {
            patient: {
              first_name: { contains: filters.from, mode: "insensitive" },
            },
          },
          {
            patient: {
              last_name: { contains: filters.from, mode: "insensitive" },
            },
          },
          {
            patient: {
              OR: [
                {
                  first_name: { 
                    contains: filters.from.split(' ')[0] || '', 
                    mode: "insensitive" 
                  },
                },
                {
                  last_name: { 
                    contains: filters.from.split(' ')[1] || filters.from.split(' ')[0] || '', 
                    mode: "insensitive" 
                  },
                },
              ],
            },
          },
        ],
      });
    }

    // Specific doctor name filter (from advanced search)
    if (filters.doctor) {
      conditions.push({
        doctor: {
          name: { contains: filters.doctor, mode: "insensitive" },
        },
      });
    }
  }

  // Return combined query or empty object if no conditions
  return conditions.length > 0 ? { AND: conditions } : {};
};

// Updated getPatientAppointments function with enhanced filtering
export async function getPatientAppointments({
  page,
  limit,
  search,
  id,
  filters,
}: AllAppointmentsProps) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;
    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    // Build the where clause with all filters
    const whereClause = buildQuery(id, search, filters);

    console.log('Database Query Where Clause:', JSON.stringify(whereClause, null, 2));

    const [data, totalRecord] = await Promise.all([
      db.appointment.findMany({
        where: whereClause,
        skip: SKIP,
        take: LIMIT,
        select: {
          id: true,
          patient_id: true,
          doctor_id: true,
          type: true,
          appointment_date: true,
          time: true,
          status: true,
          priority_level: true,
          priority_score: true,
          priority_override: true,
          booked_by: true,
          created_at: true,
          patient: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              phone: true,
              gender: true,
              img: true,
              date_of_birth: true,
              colorCode: true,
            },
          },
          doctor: {
            select: {
              id: true,
              name: true,
              specialization: true,
              colorCode: true,
              img: true,
            },
          },
          bookedByStaff: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        // OPTIMAL HOSPITAL ORDERING (keeping your existing priority system)
        orderBy: [
          {
            priority_override: "asc",
          },
          // 1. EMERGENCY first (highest medical priority)
          {
            priority_level: "desc", // EMERGENCY > URGENT > NORMAL
          },
          // 2. Within same priority, highest scores first
          {
            priority_score: "desc",
          },
          // 3. Status priority: SCHEDULED > PENDING > others
          {
            status: "asc", // Depends on enum order, may need custom logic
          },
          // 4. Earliest appointments first (time sensitivity)
          {
            appointment_date: "asc",
          },
          // 5. Final tie-breaker: newest bookings first
          {
            created_at: "desc",
          },
        ],
      }),
      db.appointment.count({
        where: whereClause,
      }),
    ]);

    if (!data) {
      return {
        success: false,
        message: "Appointment data not found",
        status: 200,
        data: null,
      };
    }

    const totalPages = Math.ceil(totalRecord / LIMIT);

    return {
      success: true,
      data,
      totalPages,
      currentPage: PAGE_NUMBER,
      totalRecord,
      status: 200,
    };
  } catch (error) {
    console.error('Error in getPatientAppointments:', error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}


export async function getAppointmentWithMedicalRecordsById(id: number) {
  try {
    if (!id) {
      return {
        success: false,
        message: "Appointment id does not exist.",
        status: 404,
      };
    }

    const data = await db.appointment.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: true,
        bills: true,
        medical: {
          include: {
            diagnosis: true,
            lab_test: true,
            vital_signs: true,
          },
        },
      },
    });

    if (!data) {
      return {
        success: false,
        message: "Appointment data not found",
        status: 200,
 
      };
    }

    return { success: true, data, status: 200 };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}