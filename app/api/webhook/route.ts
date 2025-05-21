// app/api/payment/webhook/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the webhook payload
    const payload = await request.json();
    const data = payload.data;
    
    console.log("===Webhook triggered===");
    console.log(JSON.stringify(data, null, 2));
    
    // Handle different webhook event types
    if (data.attributes.type === "source.chargeable") {
      // GCash and GrabPay payments that are ready to be charged
      console.log("E-wallet Payment Chargeable");
      
      // Create a payment using the source
      const options = {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            process.env.PAYMONGO_SECRET as string
          ).toString("base64")}`,
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: data.attributes.data.attributes.amount,
              source: { 
                id: data.attributes.data.id, 
                type: data.attributes.data.type 
              },
              description: data.attributes.data.attributes.description || "Payment via webhook",
              currency: 'PHP',
              statement_descriptor: data.attributes.data.attributes.statement_descriptor || "Your Business Name"
            }
          }
        })
      };
      
      const response = await fetch('https://api.paymongo.com/v1/payments', options);
      const result = await response.json();
      
      console.log("Payment created:", JSON.stringify(result, null, 2));
      
    } else if (data.attributes.type === "payment.paid") {
      // All payment types when payment is successful
      console.log("Payment Paid");
      
      // Here you would typically:
      // 1. Update your database to mark the payment as successful
      // 2. Fulfill the order/service
      // 3. Send confirmation email/notification to customer
      
      // For now, we're just logging the event
      console.log(`Successfully processed payment: ${data.attributes.data.id}`);
      
    } else if (data.attributes.type === "payment.failed") {
      // Failed payments - Cards, PayMaya
      console.log("Payment Failed");
      
      // Here you would typically:
      // 1. Update your database to mark the payment as failed
      // 2. Notify the customer about the failure
      // 3. Maybe offer alternative payment methods
      
      console.log(`Failed payment: ${data.attributes.data.id}`);
      console.log(`Reason: ${data.attributes.data.attributes.failed_code || "Unknown"}`);
    }
    
    // Always return a 200 status to acknowledge receipt of the webhook
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error) {
    console.error("Error processing webhook:", error);
    // Still return 200 to avoid PayMongo retrying
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 200 });
  }
}
