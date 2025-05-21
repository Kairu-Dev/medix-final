'use client';
/* eslint-disable */
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RotateCw, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Component that uses useSearchParams wrapped in Suspense
function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const paymentId = searchParams.get('payment_id');
  const sourceId = searchParams.get('source_id');
  const errorCode = searchParams.get('error_code');
  
  useEffect(() => {
    async function verifyFailure() {
      try {
        if (errorCode) {
          // Handle specific error codes from PayMongo
          switch (errorCode) {
            case 'authentication_failed':
              setErrorMessage('Authentication with the payment provider failed.');
              break;
            case 'processing_error':
              setErrorMessage('An error occurred while processing your payment.');
              break;
            case 'insufficient_funds':
              setErrorMessage('Insufficient funds in your account to complete this payment.');
              break;
            case 'expired_card':
              setErrorMessage('The card you are using has expired.');
              break;
            default:
              setErrorMessage('Your payment could not be processed. Please try again.');
          }
        } else if (sourceId) {
          // If we have a source ID, check the actual status
          const response = await fetch(`/api/payment/verifysource?source_id=${sourceId}`);
          const result = await response.json();
          
          if (result.error) {
            setErrorMessage(result.error.detail || 'Payment verification failed.');
          } else if (result.body?.data?.attributes?.status === 'failed') {
            setErrorMessage(result.body.data.attributes.failure_code || 'Payment failed.');
          } else {
            setErrorMessage('Your payment could not be processed. Please try again.');
          }
        } else {
          setErrorMessage('Payment failed. Please try again or choose a different payment method.');
        }
      } catch (error) {
        console.error('Error verifying payment failure:', error);
        setErrorMessage('An error occurred while checking payment status.');
      } finally {
        setIsVerifying(false);
      }
    }
    
    verifyFailure();
  }, [errorCode, sourceId]);

  return (
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="bg-red-600 p-6 flex justify-center">
        {isVerifying ? (
          <Loader2 className="h-16 w-16 text-white animate-spin" />
        ) : (
          <XCircle className="h-16 w-16 text-white" />
        )}
      </div>
      
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">
          {isVerifying ? 'Checking Payment Status...' : 'Payment Failed'}
        </h1>
        
        <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
          {isVerifying ? 'Please wait while we check your payment status...' : errorMessage}
        </p>
        
        <div className="flex flex-col gap-3">
          {/*
          {!isVerifying && (
            <Link href={`/payment?retry=${paymentId}`} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200">
              <RotateCw className="h-4 w-4" />
              <span>Try Again</span>
            </Link>
          )} */}
          
          <Link href="/" className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <Suspense fallback={
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden p-6 text-center">
          <Loader2 className="h-16 w-16 mx-auto text-gray-400 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading payment information...</p>
        </div>
      }>
        <PaymentFailedContent />
      </Suspense>
    </div>
  );
}




{/*'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { XCircle, ArrowLeft, RotateCw, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function PaymentFailedPage() {
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  
  const paymentId = searchParams.get('payment_id');
  const sourceId = searchParams.get('source_id');
  const errorCode = searchParams.get('error_code');
  
  useEffect(() => {
    async function verifyFailure() {
      try {
        if (errorCode) {
          // Handle specific error codes from PayMongo
          switch (errorCode) {
            case 'authentication_failed':
              setErrorMessage('Authentication with the payment provider failed.');
              break;
            case 'processing_error':
              setErrorMessage('An error occurred while processing your payment.');
              break;
            case 'insufficient_funds':
              setErrorMessage('Insufficient funds in your account to complete this payment.');
              break;
            case 'expired_card':
              setErrorMessage('The card you are using has expired.');
              break;
            default:
              setErrorMessage('Your payment could not be processed. Please try again.');
          }
        } else if (sourceId) {
          // If we have a source ID, check the actual status
          const response = await fetch(`/api/payment/verifysource?source_id=${sourceId}`);
          const result = await response.json();
          
          if (result.error) {
            setErrorMessage(result.error.detail || 'Payment verification failed.');
          } else if (result.body?.data?.attributes?.status === 'failed') {
            setErrorMessage(result.body.data.attributes.failure_code || 'Payment failed.');
          } else {
            setErrorMessage('Your payment could not be processed. Please try again.');
          }
        } else {
          setErrorMessage('Payment failed. Please try again or choose a different payment method.');
        }
      } catch (error) {
        console.error('Error verifying payment failure:', error);
        setErrorMessage('An error occurred while checking payment status.');
      } finally {
        setIsVerifying(false);
      }
    }
    
    verifyFailure();
  }, [errorCode, sourceId]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="bg-red-600 p-6 flex justify-center">
          {isVerifying ? (
            <Loader2 className="h-16 w-16 text-white animate-spin" />
          ) : (
            <XCircle className="h-16 w-16 text-white" />
          )}
        </div>
        
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center mb-2">
            {isVerifying ? 'Checking Payment Status...' : 'Payment Failed'}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
            {isVerifying ? 'Please wait while we check your payment status...' : errorMessage}
          </p>
          
          <div className="flex flex-col gap-3">
            {/*
            {!isVerifying && (
              <Link href={`/payment?retry=${paymentId}`} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200">
                <RotateCw className="h-4 w-4" />
                <span>Try Again</span>
              </Link>
            )} 
            
            <Link href="/" className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors duration-200">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
  */}