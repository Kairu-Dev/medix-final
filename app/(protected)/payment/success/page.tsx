'use client';

import { useEffect, useState, Suspense } from 'react'; // Added Suspense import
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
  /* eslint-disable */

// Create a client component that safely uses useSearchParams inside Suspense
function PaymentVerification() {
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'error'>('pending');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  const paymentId = searchParams.get('payment_id');
  const sourceId = searchParams.get('source_id');
  const appointmentId = searchParams.get('appointment_id');
  
  useEffect(() => {
    async function verifyPayment() {
      if (!paymentId) {
        setIsVerifying(false);
        setPaymentStatus('error');
        return;
      }
      
      try {
        // If we have a source_id from e-wallet payment, we can verify it
        if (sourceId) {
          const response = await fetch(`/api/payment/verifysource?source_id=${sourceId}`);
          const result = await response.json();
          
          if (result.body?.data?.attributes?.status === 'paid') {
            setPaymentStatus('success');
            setPaymentDetails(result.body.data);
          } else {
            setPaymentStatus('pending');
          }
        } else {
          // For card payments or direct verification
          // You can implement additional verification here if needed
          setPaymentStatus('success');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentStatus('error');
      } finally {
        setIsVerifying(false);
      }
    }
    
    verifyPayment();
  }, [paymentId, sourceId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-emerald-600 p-6 flex justify-center">
          {isVerifying ? (
            <Loader2 className="h-16 w-16 text-white animate-spin" />
          ) : paymentStatus === 'success' ? (
            <CheckCircle className="h-16 w-16 text-white" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-yellow-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">?</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">
            {isVerifying ? 'Verifying Payment...' : 
             paymentStatus === 'success' ? 'Payment Successful!' : 
             paymentStatus === 'pending' ? 'Payment Processing' : 'Verification Error'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            {isVerifying ? 'Please wait while we verify your payment...' :
             paymentStatus === 'success' ? 'Thank you for your payment. Your transaction has been completed successfully.' :
             paymentStatus === 'pending' ? 'Your payment is being processed. This might take a few moments.' :
             'We couldn\'t verify your payment. If you believe this is an error, please contact support.'}
          </p>
          
          {paymentDetails && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Payment Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                  <span className="font-medium text-gray-800 dark:text-white">{paymentDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    ₱{(paymentDetails.attributes.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <Link 
href="/"
className="inline-flex items-center justify-center gap-2 bg-emerald-900/70 hover:bg-emerald-800/70 text-emerald-100 px-4 py-2 rounded-lg border border-emerald-500/30 transition-colors duration-200 w-full"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function PaymentLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-emerald-600 p-6 flex justify-center">
          <Loader2 className="h-16 w-16 text-white animate-spin" />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">
            Loading Payment Information...
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            Please wait while we load your payment details...
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component that uses Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentLoadingFallback />}>
      <PaymentVerification />
    </Suspense>
  );
}





{/*'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'pending' | 'error'>('pending');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  
  const paymentId = searchParams.get('payment_id');
  const sourceId = searchParams.get('source_id');
  const appointmentId = searchParams.get('appointment_id'); // Add this to get appointment_id from URL
  
  useEffect(() => {
    async function verifyPayment() {
      if (!paymentId) {
        setIsVerifying(false);
        setPaymentStatus('error');
        return;
      }
      
      try {
        // If we have a source_id from e-wallet payment, we can verify it
        if (sourceId) {
          const response = await fetch(`/api/payment/verifysource?source_id=${sourceId}`);
          const result = await response.json();
          
          if (result.body?.data?.attributes?.status === 'paid') {
            setPaymentStatus('success');
            setPaymentDetails(result.body.data);
          } else {
            setPaymentStatus('pending');
          }
        } else {
          // For card payments or direct verification
          // You can implement additional verification here if needed
          setPaymentStatus('success');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setPaymentStatus('error');
      } finally {
        setIsVerifying(false);
      }
    }
    
    verifyPayment();
  }, [paymentId, sourceId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-emerald-600 p-6 flex justify-center">
          {isVerifying ? (
            <Loader2 className="h-16 w-16 text-white animate-spin" />
          ) : paymentStatus === 'success' ? (
            <CheckCircle className="h-16 w-16 text-white" />
          ) : (
            <div className="h-16 w-16 rounded-full bg-yellow-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">?</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">
            {isVerifying ? 'Verifying Payment...' : 
             paymentStatus === 'success' ? 'Payment Successful!' : 
             paymentStatus === 'pending' ? 'Payment Processing' : 'Verification Error'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            {isVerifying ? 'Please wait while we verify your payment...' :
             paymentStatus === 'success' ? 'Thank you for your payment. Your transaction has been completed successfully.' :
             paymentStatus === 'pending' ? 'Your payment is being processed. This might take a few moments.' :
             'We couldn\'t verify your payment. If you believe this is an error, please contact support.'}
          </p>
          
          {paymentDetails && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Payment Details</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                  <span className="font-medium text-gray-800 dark:text-white">{paymentDetails.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    ₱{(paymentDetails.attributes.amount / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <Link 
            href={`/record/appointments/${appointmentId || paymentId}?cat=bills`}
            className="inline-flex items-center justify-center gap-2 bg-emerald-900/70 hover:bg-emerald-800/70 text-emerald-100 px-4 py-2 rounded-lg border border-emerald-500/30 transition-colors duration-200 w-full"
          >
            <ArrowLeft size={16} />
            <span>Back to Billing</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
*/}