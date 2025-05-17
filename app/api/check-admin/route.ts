// app/api/check-admin/route.ts
import { checkRole } from '@/utils/roles';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user || !user.id) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
   
    // Check if user has admin role
    const isAdmin = await checkRole("ADMIN");
   
    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}