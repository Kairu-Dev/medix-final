// app/api/payment/createpaymentmethod/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Creating our options for the Create a Payment Method call
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC as string
        ).toString("base64")}`, // HTTP Basic Auth and Encoding with public key
      },
      body: JSON.stringify(body),
    };
    
    // Calling the Create a Payment Method API
    const response = await fetch("https://api.paymongo.com/v1/payment_methods", options);
    const result = await response.json();
    
    if (result.errors) {
      console.log(JSON.stringify(result.errors));
      return NextResponse.json({ error: result.errors }, { status: 400 });
    } else {
      return NextResponse.json({ body: result }, { status: 200 });
    }
  } catch (error) {
    console.error("Error creating payment method:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}