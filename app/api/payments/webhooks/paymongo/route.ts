// app/api/payment/webhook/route.ts
import { NextResponse } from 'next/server';
  /* eslint-disable */
// This will be used to validate webhooks using the signature in headers
function validatePaymongoWebhook(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  // In a production environment, you should verify the webhook signature
  // For now, we'll assume all webhooks are valid for testing
  return true;
}

export async function POST(request: Request) {
  try {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.error("Missing webhook secret in environment variables");
      return NextResponse.json({ error: "Server not configured for webhooks" }, { status: 500 });
    }
    
    // Get request body as text for signature verification
    const body = await request.text();
    const signature = request.headers.get('paymongo-signature') || '';
    
    // Validate webhook signature (if enabled)
    if (webhookSecret !== 'TEST_NO_VALIDATION') {
      const isValid = validatePaymongoWebhook(body, signature, webhookSecret);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }
    
    // Parse the body for processing
    const data = JSON.parse(body).data;
    console.log("=== Webhook triggered ===");
    console.log("Event type:", data.attributes.type);
    console.log("Event data:", data);
    console.log("=== Webhook end ===");
    
    // Handle different event types
    if (data.attributes.type === "source.chargeable") {
      // Process e-wallet payments (GCash/GrabPay)
      console.log("E-wallet Payment Chargeable");
      
      // Create a payment using the source
      await createPaymentFromSource(data);
    }
    
    if (data.attributes.type === "payment.paid") {
      // All payment types - payment successful
      console.log("Payment Paid");
      const paymentId = data.attributes.data.id;
      const amount = data.attributes.data.attributes.amount / 100; // Convert from centavos to PHP
      
      // Here you would update your database to record the successful payment
      // For now, we'll just log it
      console.log(`Payment ${paymentId} succeeded. Amount: PHP ${amount}`);
      
      // You can add your own logic here to update order status, send email notifications, etc.
    }
    
    if (data.attributes.type === "payment.failed") {
      // Failed payments - Cards, PayMaya
      console.log("Payment Failed");
      const paymentId = data.attributes.data.id;
      const failureCode = data.attributes.data.attributes.failed_code;
      const failureMessage = data.attributes.data.attributes.failed_message;
      
      console.log(`Payment ${paymentId} failed. Reason: ${failureCode} - ${failureMessage}`);
      
      // You can add your own logic here to handle failed payments
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Function to create a payment from a chargeable source
async function createPaymentFromSource(data: any) {
  try {
    const sourceId = data.attributes.data.id;
    const sourceType = data.attributes.data.type;
    const amount = data.attributes.data.attributes.amount;
    
    // Creating options for the payment creation
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.PAYMONGO_SECRET as string
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount,
            source: { id: sourceId, type: sourceType },
            currency: "PHP",
            description: data.attributes.data.attributes.description || "Payment from webhook",
            statement_descriptor: "Your Business Name"
          }
        }
      }),
    };
    
    // Call the PayMongo API to create the payment
    const response = await fetch("https://api.paymongo.com/v1/payments", options);
    const result = await response.json();
    
    if (result.errors) {
      console.error("Error creating payment from source:", result.errors);
      return false;
    } else {
      console.log("Payment created successfully:", result.data.id);
      return true;
    }
  } catch (error) {
    console.error("Error creating payment from source:", error);
    return false;
  }
}