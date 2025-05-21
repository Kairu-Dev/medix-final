// app/api/payments/updatePayment/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { paymentId, method, amount } = await request.json();
    
    if (!paymentId || !method || amount === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Get the current payment record
    const currentPayment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });
    
    if (!currentPayment) {
      return NextResponse.json(
        { success: false, error: "Payment not found" },
        { status: 404 }
      );
    }
    
    // Calculate new amount_paid and determine status
    const newAmountPaid = currentPayment.amount_paid + amount;
    const payableAmount = currentPayment.total_amount - currentPayment.discount;
    
    let newStatus = currentPayment.status;
    
    if (newAmountPaid >= payableAmount) {
      newStatus = 'PAID';
    } else if (newAmountPaid > 0) {
      newStatus = 'PART';
    }
    
    // Update the payment record
    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        amount_paid: newAmountPaid,
        status: newStatus,
        payment_method: method,
        payment_date: new Date(),
      },
    });
    
    return NextResponse.json(
      { 
        success: true, 
        data: updatedPayment 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}