import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PaylinkService } from '@/lib/paylink';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const transactionNo = searchParams.get('transactionNo');
    const email = searchParams.get('email');
    const planType = searchParams.get('plan');

    if (!transactionNo || !email || !planType) {
        return NextResponse.redirect(new URL('/?error=invalid_callback', request.url));
    }

    try {
        // Verify payment status with Paylink
        const status = await PaylinkService.getInvoiceStatus(transactionNo);

        if (status.orderStatus === 'Paid') {
            const subscription_end = planType === 'pro'
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                : null;

            await db.execute({
                sql: 'UPDATE users SET plan_type = ?, subscription_end = ? WHERE email = ?',
                args: [planType, subscription_end, email],
            });

            // Redirect to a success page or home with success message
            return NextResponse.redirect(new URL('/?success=payment_completed', request.url));
        } else {
            console.warn('Payment not completed:', status.orderStatus);
            return NextResponse.redirect(new URL('/?error=payment_failed', request.url));
        }
    } catch (error) {
        console.error('Error in Paylink callback:', error);
        return NextResponse.redirect(new URL('/?error=server_error', request.url));
    }
}
