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
            const planResult = await db.execute({
                sql: 'SELECT duration FROM subscription_plans WHERE id = ?',
                args: [planType]
            });

            let subscription_end = null;
            if (planResult.rows.length > 0) {
                const duration = planResult.rows[0].duration as string;
                if (duration === '1 year') {
                    subscription_end = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
                } else if (duration !== 'unlimited') {
                    // Default fallback or more logic for other durations like '1 month'
                    subscription_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                }
            }

            await db.execute({
                sql: 'UPDATE users SET plan_type = ?, subscription_end = ? WHERE email = ?',
                args: [planType, subscription_end, email],
            });

            // Redirect to a success page
            return NextResponse.redirect(new URL('/payment/success', request.url));
        } else {
            console.warn('Payment not completed:', status.orderStatus);
            return NextResponse.redirect(new URL('/payment/cancel', request.url));
        }
    } catch (error) {
        console.error('Error in Paylink callback:', error);
        return NextResponse.redirect(new URL('/payment/cancel?error=server_error', request.url));
    }
}
