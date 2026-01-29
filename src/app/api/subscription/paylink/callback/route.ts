import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PaylinkService } from '@/lib/paylink';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const transactionNo = searchParams.get('transactionNo');
    const email = searchParams.get('email');
    const planType = searchParams.get('plan');
    const returnPath = searchParams.get('returnPath') || '/board';

    if (!transactionNo || !email || !planType) {
        return NextResponse.redirect(new URL(`/?error=invalid_callback&returnPath=${encodeURIComponent(returnPath)}`, request.url));
    }

    try {
        // Verify payment status with Paylink
        const status = await PaylinkService.getInvoiceStatus(transactionNo);

        if (status.orderStatus === 'Paid') {
            // Fetch current user subscription status
            const userResult = await db.execute({
                sql: 'SELECT subscription_end FROM users WHERE email = ?',
                args: [email]
            });

            const currentEnd = userResult.rows[0]?.subscription_end as string | null;
            const now = Date.now();
            let baseDate = now;

            // If current subscription is still active, add to it
            if (currentEnd && new Date(currentEnd).getTime() > now) {
                baseDate = new Date(currentEnd).getTime();
            }

            const planResult = await db.execute({
                sql: 'SELECT duration FROM subscription_plans WHERE id = ?',
                args: [planType]
            });

            let subscription_end = null;
            if (planResult.rows.length > 0) {
                const duration = planResult.rows[0].duration as string;
                if (duration === '1 year') {
                    subscription_end = new Date(baseDate + 365 * 24 * 60 * 60 * 1000).toISOString();
                } else if (duration === 'unlimited') {
                    subscription_end = null;
                } else {
                    // Default to 1 month (30 days) if not specified or different
                    subscription_end = new Date(baseDate + 30 * 24 * 60 * 60 * 1000).toISOString();
                }
            }

            await db.execute({
                sql: 'UPDATE users SET plan_type = ?, subscription_end = ? WHERE email = ?',
                args: [planType, subscription_end, email],
            });

            // Fetch settings for redirection
            const siteSettingsResult = await db.execute('SELECT value FROM site_settings WHERE key = "next_public_base_url"');
            const paymentSettingsResult = await db.execute('SELECT value FROM payment_settings WHERE key = "payment_callback_url"');

            const baseUrl = siteSettingsResult.rows[0]?.value as string || process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
            let successUrl = `${baseUrl}/payment/success`;

            if (paymentSettingsResult.rows.length > 0 && paymentSettingsResult.rows[0].value) {
                const userSuccessUrl = paymentSettingsResult.rows[0].value as string;
                successUrl = userSuccessUrl.startsWith('http') ? userSuccessUrl : `${baseUrl}/${userSuccessUrl.replace(/^\//, '')}`;
            }

            // Append returnPath
            const separator = successUrl.includes('?') ? '&' : '?';
            successUrl = `${successUrl}${separator}returnPath=${encodeURIComponent(returnPath)}`;

            // Redirect to the success page
            return NextResponse.redirect(new URL(successUrl, request.url));
        } else {
            console.warn('Payment not completed:', status.orderStatus);

            // Fetch cancel URL from settings
            const siteSettingsResult = await db.execute('SELECT value FROM site_settings WHERE key = "next_public_base_url"');
            const paymentSettingsResult = await db.execute('SELECT value FROM payment_settings WHERE key = "payment_cancel_url"');

            const baseUrl = siteSettingsResult.rows[0]?.value as string || process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin;
            let cancelUrl = `${baseUrl}/payment/cancel`;

            if (paymentSettingsResult.rows.length > 0 && paymentSettingsResult.rows[0].value) {
                const userCancelUrl = paymentSettingsResult.rows[0].value as string;
                cancelUrl = userCancelUrl.startsWith('http') ? userCancelUrl : `${baseUrl}/${userCancelUrl.replace(/^\//, '')}`;
            }

            // Append returnPath
            const separator = cancelUrl.includes('?') ? '&' : '?';
            cancelUrl = `${cancelUrl}${separator}returnPath=${encodeURIComponent(returnPath)}`;

            return NextResponse.redirect(new URL(cancelUrl, request.url));
        }
    } catch (error) {
        console.error('Error in Paylink callback:', error);
        return NextResponse.redirect(new URL('/payment/cancel?error=server_error', request.url));
    }
}
