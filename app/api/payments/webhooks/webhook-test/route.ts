// app/api/payment/webhook-test/route.ts
// There's really no way to test this.
import { NextResponse } from 'next/server';
  /* eslint-disable */
/**
 * This endpoint is just for development testing.
 * It simulates PayMongo sending a webhook event to your endpoint.
 * DO NOT USE IN PRODUCTION!
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventType = body.eventType || 'payment.paid'; // Default event type
    
    // Create sample data based on event type
    let webhookPayload;
    
    switch (eventType) {
      case 'source.chargeable':
        webhookPayload = createSourceChargeableEvent(body);
        break;
      case 'payment.paid':
        webhookPayload = createPaymentPaidEvent(body);
        break;
      case 'payment.failed':
        webhookPayload = createPaymentFailedEvent(body);
        break;
      default:
        return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }
    
    // Call your webhook endpoint
    const webhookUrl = new URL('/api/payments/webhooks/webhook-test', request.url).toString();
    console.log(`Sending test webhook of type ${eventType} to ${webhookUrl}`);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'paymongo-signature': 'test_signature'
      },
      body: JSON.stringify(webhookPayload)
    });
    
    const result = await response.text();
    return NextResponse.json({ 
      success: response.ok,
      status: response.status,
      response: result
    });
    
  } catch (error) {
    console.error("Error in test webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function createSourceChargeableEvent(data: any) {
  const sourceId = data.sourceId || 'src_' + generateRandomId();
  const amount = data.amount || 10000; // Default 100 PHP
  
  return {
    data: {
      id: 'hook_' + generateRandomId(),
      type: 'webhook',
      attributes: {
        type: 'source.chargeable',
        livemode: false,
        data: {
          id: sourceId,
          type: 'source',
          attributes: {
            amount: amount,
            billing: {
              address: {
                city: 'Cebu City',
                country: 'PH',
                line1: 'Test Address',
                line2: null,
                postal_code: '6000',
                state: 'Cebu'
              },
              email: data.email || 'test@example.com',
              name: data.name || 'Test Customer',
              phone: data.phone || '09123456789'
            },
            currency: 'PHP',
            description: data.description || 'Test transaction',
            livemode: false,
            redirect: {
              checkout_url: 'https://sandbox-checkout.paymongo.com/source_test',
              failed: 'http://localhost:3000/payment/failed',
              success: 'http://localhost:3000/payment/success'
            },
            status: 'chargeable',
            type: data.sourceType || 'gcash'
          }
        }
      }
    }
  };
}

function createPaymentPaidEvent(data: any) {
  const paymentId = data.paymentId || 'pay_' + generateRandomId();
  const amount = data.amount || 10000; // Default 100 PHP
  
  return {
    data: {
      id: 'hook_' + generateRandomId(),
      type: 'webhook',
      attributes: {
        type: 'payment.paid',
        livemode: false,
        data: {
          id: paymentId,
          type: 'payment',
          attributes: {
            access_url: null,
            amount: amount,
            balance_transaction_id: 'bal_txn_' + generateRandomId(),
            billing: {
              address: {
                city: 'Cebu City',
                country: 'PH',
                line1: 'Test Address',
                line2: null,
                postal_code: '6000',
                state: 'Cebu'
              },
              email: data.email || 'test@example.com',
              name: data.name || 'Test Customer',
              phone: data.phone || '09123456789'
            },
            currency: 'PHP',
            description: data.description || 'Test successful payment',
            fee: 250,
            livemode: false,
            net_amount: amount - 250, // fee is 2.5 PHP
            payment_intent_id: 'pi_' + generateRandomId(),
            payout: null,
            source: {
              id: 'src_' + generateRandomId(),
              type: data.sourceType || 'card'
            },
            statement_descriptor: 'Your Business Name',
            status: 'paid',
            tax_amount: null
          }
        }
      }
    }
  };
}

function createPaymentFailedEvent(data: any) {
  const paymentId = data.paymentId || 'pay_' + generateRandomId();
  const amount = data.amount || 10000; // Default 100 PHP
  
  return {
    data: {
      id: 'hook_' + generateRandomId(),
      type: 'webhook',
      attributes: {
        type: 'payment.failed',
        livemode: false,
        data: {
          id: paymentId,
          type: 'payment',
          attributes: {
            access_url: null,
            amount: amount,
            balance_transaction_id: null,
            billing: {
              address: {
                city: 'Cebu City',
                country: 'PH',
                line1: 'Test Address',
                line2: null,
                postal_code: '6000',
                state: 'Cebu'
              },
              email: data.email || 'test@example.com',
              name: data.name || 'Test Customer',
              phone: data.phone || '09123456789'
            },
            currency: 'PHP',
            description: data.description || 'Test failed payment',
            failed_code: data.failedCode || 'card_declined',
            failed_message: data.failedMessage || 'The card was declined',
            fee: 0,
            livemode: false,
            net_amount: 0,
            payment_intent_id: 'pi_' + generateRandomId(),
            payout: null,
            source: {
              id: 'src_' + generateRandomId(),
              type: data.sourceType || 'card'
            },
            statement_descriptor: 'Your Business Name',
            status: 'failed',
            tax_amount: null
          }
        }
      }
    }
  };
}

function generateRandomId() {
  return Math.random().toString(36).substring(2, 15);
}
