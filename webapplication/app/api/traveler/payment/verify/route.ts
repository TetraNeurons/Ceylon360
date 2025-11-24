import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db/drizzle';
import { payments } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // Update payment status in database if not already updated
      const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.stripeSessionId, sessionId))
        .limit(1);

      if (payment && payment.status !== 'PAID') {
        await db
          .update(payments)
          .set({
            status: 'PAID',
            paidAt: new Date(),
          })
          .where(eq(payments.id, payment.id));

        console.log('Payment verified and updated to PAID:', payment.id);
      }

      return NextResponse.json({
        success: true,
        paymentStatus: 'PAID',
      });
    }

    return NextResponse.json({
      success: true,
      paymentStatus: session.payment_status,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment', details: error.message },
      { status: 500 }
    );
  }
}
