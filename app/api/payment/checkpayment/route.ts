// app/api/payment/checkpayment/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const clientKey = searchParams.get('client_key');
    
    if (!id || !clientKey) {
      return NextResponse.json(
        { error: "Missing required parameters" }, 
        { status: 400 }
      );
    }
    
    // Creating our options for the check payment status call
    const options = {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.NEXT_PUBLIC_PAYMONGO_PUBLIC as string
        ).toString("base64")}`, // HTTP Basic Auth and Encoding with public key
      },
    };
    
    // Calling the Retrieve Payment Intent API
    const response = await fetch(
      `https://api.paymongo.com/v1/payment_intents/${id}?client_key=${clientKey}`, 
      options
    );
    
    const result = await response.json();
    
    if (result.errors) {
      console.log(JSON.stringify(result.errors));
      return NextResponse.json({ error: result.errors }, { status: 400 });
    } else {
      return NextResponse.json({ body: result }, { status: 200 });
    }
  } catch (error) {
    console.error("Error checking payment status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}