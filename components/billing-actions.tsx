'use client';
// components/ClientPaymentButton.tsx
  /* eslint-disable */
import { useState } from 'react';
import  PayButton  from './PayButton'; // Import the original PayButton

interface ClientPaymentButtonProps {
  payment: any; // Replace 'any' with the appropriate type for 'payment' if known
}

export default function ClientPaymentButton({ payment }: ClientPaymentButtonProps) {
  // We'll implement a listener for the page reload instead of passing onPaymentComplete prop
  // This keeps the same logic (reload the page after payment) but makes it compatible with PayButton

  // Use useEffect to set up a reload listener if needed
  // But for now, we just pass the payment prop to the PayButton

  return (
    <div className="mt-4">
      <PayButton
        payment={payment}
      />
    </div>
  );
}