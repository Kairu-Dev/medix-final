import db from '@/lib/db';
import { NextResponse } from 'next/server';
//app>api>doctors>route.ts

export async function GET() {
  try {
    // For the referral system, we want to fetch all doctors without requiring authentication
    // This allows the component to function properly in various contexts
    
    // Fetch all doctors with their department
    const doctors = await db.doctor.findMany({
      select: {
        id: true,
        name: true,
        specialization: true,
        department: true
      }
    });

    return NextResponse.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctors' },
      { status: 500 }
    );
  }
}