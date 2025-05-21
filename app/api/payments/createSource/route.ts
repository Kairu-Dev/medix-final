// app/api/payment/createsource/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Creating options for the source creation
    const options = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          process.env.PAYMONGO_SECRET as string
        ).toString("base64")}`, // HTTP Basic Auth and Encoding
      },
      body: JSON.stringify(body),
    };
    
    // Calling the Create Source API
    const response = await fetch("https://api.paymongo.com/v1/sources", options);
    const result = await response.json();
    
    if (result.errors) {
      console.log(JSON.stringify(result.errors));
      return NextResponse.json({ error: result.errors }, { status: 400 });
    } else {
      return NextResponse.json({ body: result }, { status: 200 });
    }
  } catch (error) {
    console.error("Error creating source:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}