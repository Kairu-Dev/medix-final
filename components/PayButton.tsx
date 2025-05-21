'use client';

import { useState } from 'react';
import { CreditCard, DollarSign, Loader2 } from 'lucide-react';

interface PaymentPatient {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
}

interface PaymentProps {
  id: string;
  total_amount: number;
  discount: number;
  amount_paid: number;
  receipt_number: string;
  patient: PaymentPatient;
}

interface PayButtonProps {
  payment?: PaymentProps;
}

export function PayButton({ payment = { 
  id: '1747795081903', 
  total_amount: 250, 
  discount: 0, 
  amount_paid: 0, 
  receipt_number: '1234', 
  patient: { 
    first_name: '', 
    last_name: '', 
    phone: '', 
    email: '' 
  } 
} }: PayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    cardHolder: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  // Calculate balance
  const balance = payment.total_amount - payment.discount - payment.amount_paid;
  const hasBalance = balance > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayNow = () => {
    setShowPaymentOptions(!showPaymentOptions);
  };

  const initiatePayment = async (method: string) => {
    setIsLoading(true);
    setSelectedMethod(method);
    
    try {
      // Create payment intent
      const response = await fetch('/api/payments/createPaymentIntentV2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: Math.round(balance * 100), // Convert to centavos (Paymongo requires integer)
              payment_method_allowed: [method],
              payment_method_options: {
                card: {
                  request_three_d_secure: 'any'
                }
              },
              currency: 'PHP',
              description: `Payment for Receipt #${payment.receipt_number || 'Unknown'}`,
              statement_descriptor: 'Your Business Name'
            }
          }
        }),
      });

      const result = await response.json();
      
      if (method === 'card') {
        // For card payments, we need to create a payment method and attach it
        const paymentMethodResponse = await fetch('/api/payment/createpaymentmethod', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              attributes: {
                details: {
                  card_number: formData.cardNumber,
                  exp_month: parseInt(formData.expiryMonth),
                  exp_year: parseInt(formData.expiryYear),
                  cvc: formData.cvv,
                },
                billing: {
                  name: formData.cardHolder || formData.customerName,
                  email: formData.email,
                  phone: formData.phone,
                },
                type: "card",
              }
            }
          }),
        });
        
        const paymentMethodResult = await paymentMethodResponse.json();
        
        // Attach payment method to payment intent
        const attachResponse = await fetch('/api/payment/attachpayment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            intentId: result.body.data.id,
            methodId: paymentMethodResult.body.data.id,
            clientKey: result.body.data.attributes.client_key
          }),
        });
        
        const attachResult = await attachResponse.json();
        
        // Handle 3DS if needed
        if (attachResult.body.data.attributes.status === 'awaiting_next_action') {
          window.open(attachResult.body.data.attributes.next_action.redirect.url, "_blank");
          // Set up a listener to check payment status
          listenToPayment(result.body.data.id, attachResult.body.data.attributes.client_key);
        } else if (attachResult.body.data.attributes.status === 'succeeded') {
          // Redirect to success page
          window.location.href = `/payment/success?payment_id=${payment.id}`;
        } else {
          // Redirect to failed page
          window.location.href = `/payment/failed?payment_id=${payment.id}&error_code=${attachResult.body?.data?.attributes?.last_payment_error?.code || 'unknown'}`;
        }
      } else if (method === 'gcash' || method === 'grabpay') {
        // Create source for e-wallets
        const sourceResponse = await fetch('/api/payments/createSource', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              attributes: {
                amount: Math.round(balance * 100),
                redirect: {
                  success: `${window.location.origin}/payment/success?payment_id=${payment.id}&source_id=SOURCE_ID`,
                  failed: `${window.location.origin}/payment/failed?payment_id=${payment.id}&source_id=SOURCE_ID`
                },
                billing: {
                  name: formData.customerName,
                  phone: formData.phone,
                  email: formData.email || `customer-${payment.id}@example.com`
                },
                type: method,
                currency: 'PHP'
              }
            }
          }),
        });
        
        const sourceResult = await sourceResponse.json();
        const sourceId = sourceResult.body.data.id;
        
        // Replace SOURCE_ID placeholder with actual source ID
        const successUrl = sourceResult.body.data.attributes.redirect.checkout_url.replace('SOURCE_ID', sourceId);
        const failedUrl = sourceResult.body.data.attributes.redirect.failed.replace('SOURCE_ID', sourceId);
        
        // Redirect to checkout URL provided by Paymongo
        window.location.href = sourceResult.body.data.attributes.redirect.checkout_url;
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      alert('Payment initiation failed. Please try again.');
      window.location.href = `/payment/failed?payment_id=${payment.id}&error_code=initialization_failed`;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to listen for payment status updates
  const listenToPayment = async (paymentIntentId: string, clientKey: string) => {
    let attempts = 5;
    
    const checkStatus = async () => {
      if (attempts <= 0) return;
      
      try {
        const response = await fetch(
          `/api/payment/checkpayment?id=${paymentIntentId}&client_key=${clientKey}`
        );
        
        const result = await response.json();
        const status = result.body.data.attributes.status;
        
        if (status === 'succeeded') {
          window.location.href = `/payment/success?payment_id=${payment.id}`;
          return;
        } else if (result.body.data.attributes.last_payment_error) {
          window.location.href = `/payment/failed?payment_id=${payment.id}&error_code=${result.body.data.attributes.last_payment_error.code || 'unknown'}`;
          return;
        } else if (status === 'awaiting_payment_method' || status === 'processing') {
          // Continue polling
          attempts--;
          setTimeout(checkStatus, 3000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        attempts--;
        setTimeout(checkStatus, 3000);
      }
    };
    
    // Start checking
    setTimeout(checkStatus, 5000);
  };

  // If payment is already fully paid, don't show the button
  if (!hasBalance) {
    return null;
  }

  return (
    <div className="mt-4">
      <button
        onClick={handlePayNow}
        disabled={isLoading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg border border-emerald-500/50 transition-colors duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>Pay Now (₱{balance.toFixed(2)})</span>
          </>
        )}
      </button>

      {showPaymentOptions && !isLoading && (
        <div className="mt-3 bg-gray-50 dark:bg-gray-900 rounded-lg border p-4 animate-fadeIn">
          <h4 className="text-emerald-600 dark:text-emerald-300 font-medium text-sm mb-3">SELECT PAYMENT METHOD</h4>
          
          <div className="grid grid-cols-1 gap-2 mb-4">
            <button
              onClick={() => setSelectedMethod('card')}
              className={`${selectedMethod === 'card' ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500' : 'bg-white dark:bg-gray-800'} text-gray-800 dark:text-white px-3 py-2 rounded border transition-colors duration-200 flex items-center gap-2`}
            >
              <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Credit/Debit Card</span>
            </button>
            
            <button
              onClick={() => setSelectedMethod('gcash')}
              className={`${selectedMethod === 'gcash' ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500' : 'bg-white dark:bg-gray-800'} text-gray-800 dark:text-white px-3 py-2 rounded border transition-colors duration-200 flex items-center gap-2`}
            >
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>GCash</span>
            </button>
            
            <button
              onClick={() => setSelectedMethod('grabpay')}
              className={`${selectedMethod === 'grabpay' ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500' : 'bg-white dark:bg-gray-800'} text-gray-800 dark:text-white px-3 py-2 rounded border transition-colors duration-200 flex items-center gap-2`}
            >
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>GrabPay</span>
            </button>
          </div>
          
          {selectedMethod && (
            <div className="animate-fadeIn">
              <h4 className="text-emerald-600 dark:text-emerald-300 font-medium text-sm mb-3">BILLING INFORMATION</h4>
              
              {/* Common fields for all payment methods */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Full Name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="09XXXXXXXXX"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>
              
              {/* Card-specific fields */}
              {selectedMethod === 'card' && (
                <div className="space-y-3 mb-4">
                  <h4 className="text-emerald-600 dark:text-emerald-300 font-medium text-sm mb-3">CARD DETAILS</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Holder Name</label>
                    <input
                      type="text"
                      name="cardHolder"
                      value={formData.cardHolder}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Name on Card"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="XXXX XXXX XXXX XXXX"
                      maxLength={19}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Month</label>
                      <input
                        type="text"
                        name="expiryMonth"
                        value={formData.expiryMonth}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="MM"
                        maxLength={2}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Year</label>
                      <input
                        type="text"
                        name="expiryYear"
                        value={formData.expiryYear}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="YY"
                        maxLength={2}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="123"
                      maxLength={4}
                      required
                    />
                  </div>
                </div>
              )}
              
              <button
                onClick={() => initiatePayment(selectedMethod)}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-lg border border-emerald-500/50 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    <span>Complete Payment</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}