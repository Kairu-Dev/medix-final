
"use client";
import React from 'react';
import { useAuth } from '@clerk/nextjs';
import ReferralManager from '@/components/ReferralManager';

export default function ReferralManagementPage() {
  // Get current doctor's ID directly from Clerk
  const { userId } = useAuth();
  
  // The Doctor ID in your schema is the same as the Clerk userId
  const doctorId = userId;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {doctorId ? (
        <ReferralManager doctorId={doctorId} />
      ) : (
        <div className="text-center py-10">
          <p className="text-lg font-medium text-gray-600">Loading user information...</p>
        </div>
      )}
    </div>
  );
}