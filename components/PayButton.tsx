'use client';
/* eslint-disable */
import { useState } from 'react';
import { CreditCard, DollarSign, Loader2, Zap, Shield, ArrowRight } from 'lucide-react';

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
    <div className="mt-6 bg-gray-900/60 border border-emerald-500/40 rounded-xl shadow-lg relative backdrop-blur-sm">
      {/* Minecraft-style decorative elements */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-emerald-500/70 rounded-tl-xl"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-emerald-500/70 rounded-tr-xl"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-emerald-500/70 rounded-bl-xl"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-emerald-500/70 rounded-br-xl"></div>
      
      {/* Enhanced emerald glow effects */}
      <div className="absolute -top-3 right-8 w-24 h-24 bg-emerald-300/20 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-3 left-8 w-24 h-24 bg-emerald-200/15 rounded-full blur-3xl"></div>
      
      <div className="p-6">
        {/* Header with glowing accent */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-8 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
          <h3 className="text-lg font-bold text-white tracking-wider font-mono uppercase">Payment Portal</h3>
          <Zap className="h-5 w-5 text-emerald-400" />
        </div>

        {/* Main Pay Button */}
        <button
          onClick={handlePayNow}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-6 py-4 rounded-xl border border-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/25 hover:shadow-xl transform hover:scale-[1.02] relative overflow-hidden group"
        >
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {isLoading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="font-bold tracking-wider">PROCESSING...</span>
            </>
          ) : (
            <>
              <Shield className="h-6 w-6" />
              <span className="font-bold tracking-wider font-mono">PAY NOW - ₱{balance.toFixed(2)}</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>

        {/* Payment Options Panel */}
        {showPaymentOptions && !isLoading && (
          <div className="mt-6 bg-gradient-to-b from-emerald-50/15 to-emerald-900/30 rounded-xl p-6 border border-emerald-500/40 shadow-md backdrop-blur-sm relative">
            <div className="absolute -left-4 h-6 w-1 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.8)]"></div>
            
            <h4 className="text-emerald-200 font-bold tracking-wider font-mono uppercase text-sm mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Select Payment Method
            </h4>
            
            <div className="grid grid-cols-1 gap-3 mb-6">
              <button
                onClick={() => setSelectedMethod('card')}
                className={`${
                  selectedMethod === 'card' 
                    ? 'bg-emerald-900/70 border-emerald-400 shadow-emerald-500/25' 
                    : 'bg-gray-900/70 border-emerald-500/30 hover:border-emerald-400/60'
                } text-white px-4 py-3 rounded-lg border transition-all duration-300 flex items-center gap-3 group hover:shadow-lg`}
              >
                <CreditCard className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300" />
                <span className="font-medium tracking-wider">CREDIT / DEBIT CARD</span>
                {selectedMethod === 'card' && <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>}
              </button>
              
              <button
                onClick={() => setSelectedMethod('gcash')}
                className={`${
                  selectedMethod === 'gcash' 
                    ? 'bg-emerald-900/70 border-emerald-400 shadow-emerald-500/25' 
                    : 'bg-gray-900/70 border-emerald-500/30 hover:border-emerald-400/60'
                } text-white px-4 py-3 rounded-lg border transition-all duration-300 flex items-center gap-3 group hover:shadow-lg`}
              >
                <DollarSign className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300" />
                <span className="font-medium tracking-wider">GCASH</span>
                {selectedMethod === 'gcash' && <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>}
              </button>
              
              <button
                onClick={() => setSelectedMethod('grabpay')}
                className={`${
                  selectedMethod === 'grabpay' 
                    ? 'bg-emerald-900/70 border-emerald-400 shadow-emerald-500/25' 
                    : 'bg-gray-900/70 border-emerald-500/30 hover:border-emerald-400/60'
                } text-white px-4 py-3 rounded-lg border transition-all duration-300 flex items-center gap-3 group hover:shadow-lg`}
              >
                <DollarSign className="h-5 w-5 text-emerald-400 group-hover:text-emerald-300" />
                <span className="font-medium tracking-wider">GRABPAY</span>
                {selectedMethod === 'grabpay' && <div className="ml-auto w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>}
              </button>
            </div>
            
            {selectedMethod && (
              <div className="bg-gray-900/70 border border-emerald-500/30 rounded-xl p-5 relative">
                <div className="absolute -left-3 h-4 w-0.5 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]"></div>
                
                <h4 className="text-emerald-200 font-bold tracking-wider font-mono uppercase text-sm mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Billing Information
                </h4>
                
                {/* Common fields for all payment methods */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-emerald-300 mb-2 tracking-wide">Customer Name</label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-200"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-300 mb-2 tracking-wide">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-200"
                      placeholder="09XXXXXXXXX"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-300 mb-2 tracking-wide">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-800/70 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-200"
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                </div>
                
                {/* Card-specific fields */}
                {selectedMethod === 'card' && (
                  <div className="bg-gray-800/50 border border-emerald-500/20 rounded-lg p-4 mb-6">
                    <h4 className="text-emerald-200 font-bold tracking-wider font-mono uppercase text-sm mb-4 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Card Details
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2 tracking-wide">Card Holder Name</label>
                        <input
                          type="text"
                          name="cardHolder"
                          value={formData.cardHolder}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-900/70 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-200"
                          placeholder="Name on card"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-emerald-300 mb-2 tracking-wide">Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-900/70 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-200"
                          placeholder="XXXX XXXX XXXX XXXX"
                          maxLength={19}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-emerald-300 mb-2 tracking-wide">Month</label>
                          <input
                            type="text"
                            name="expiryMonth"
                            value={formData.expiryMonth}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-900/70 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-200"
                            placeholder="MM"
                            maxLength={2}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-emerald-300 mb-2 tracking-wide">Year</label>
                          <input
                            type="text"
                            name="expiryYear"
                            value={formData.expiryYear}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-900/70 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-200"
                            placeholder="YY"
                            maxLength={2}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-emerald-300 mb-2 tracking-wide">CVV</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-gray-900/70 border border-emerald-500/30 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 text-white placeholder-gray-400 transition-all duration-200"
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => initiatePayment(selectedMethod)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-6 py-4 rounded-xl border border-emerald-500/50 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-emerald-500/25 hover:shadow-xl transform hover:scale-[1.02] relative overflow-hidden group"
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {isLoading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="font-bold tracking-wider font-mono">PROCESSING...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="h-6 w-6" />
                      <span className="font-bold tracking-wider font-mono">COMPLETE PAYMENT</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

//OLD PAYBUTTON DESIGN AND CODE
{/* 


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
              className={`${selectedMethod === 'card' ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500' : 'bg-gray-90/70 dark:bg-gray-800'} text-gray-800 dark:text-white px-3 py-2 rounded border transition-colors duration-200 flex items-center gap-2`}
            >
              <CreditCard className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Credit/Debit Card</span>
            </button>
            
            <button
              onClick={() => setSelectedMethod('gcash')}
              className={`${selectedMethod === 'gcash' ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500' : 'bg-green-600 dark:bg-gray-800'} text-gray-800 dark:text-white px-3 py-2 rounded border transition-colors duration-200 flex items-center gap-2`}
            >
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>GCash</span>
            </button>
            
            <button
              onClick={() => setSelectedMethod('grabpay')}
              className={`${selectedMethod === 'grabpay' ? 'bg-emerald-100 dark:bg-emerald-900/60 border-emerald-500' : 'bg-green-600 dark:bg-gray-800'} text-gray-800 dark:text-white px-3 py-2 rounded border transition-colors duration-200 flex items-center gap-2`}
            >
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>GrabPay</span>
            </button>
          </div>
          
          {selectedMethod && (
            <div className="animate-fadeIn">
              <h4 className="text-emerald-600 dark:text-emerald-300 font-medium text-sm mb-3">BILLING INFORMATION</h4>
              
              {/* Common fields for all payment methods 
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
              
              {/* Card-specific fields 
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
  
  
  
  */}