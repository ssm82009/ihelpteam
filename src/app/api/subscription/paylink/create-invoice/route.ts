import { NextResponse } from 'next/server';
import { PaylinkService } from '@/lib/paylink';
import { db } from '@/lib/db';
import { getSiteSettings } from '@/lib/settings';

export async function POST(request: Request) {
    try {
        const { email, username, planType } = await request.json();

        // Fetch plan from DB
        const planResult = await db.execute({
            sql: 'SELECT * FROM subscription_plans WHERE id = ?',
            args: [planType]
        });

        if (planResult.rows.length === 0) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        const plan: any = planResult.rows[0];
        const siteSettings = await getSiteSettings();
        const baseUrl = siteSettings.next_public_base_url || process.env.NEXT_PUBLIC_BASE_URL || 'https://ihelp.team';

        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const invoice = await PaylinkService.createInvoice({
            amount: plan.price,
            clientName: username || email,
            clientEmail: email,
            clientMobile: '0500000000',
            callbackUrl: `${baseUrl}/api/subscription/paylink/callback?orderId=${orderNumber}&email=${encodeURIComponent(email)}&plan=${planType}`,
            cancelUrl: `${baseUrl}/payment/cancel`,
            orderNumber: orderNumber,
            products: [
                {
                    title: plan.name,
                    price: plan.price,
                    qty: 1,
                }
            ]
        });

        // Paylink returns transactionNo and url
        return NextResponse.json({
            url: invoice.url,
            transactionNo: invoice.transactionNo
        });

    } catch (error: any) {
        console.error('Error creating payment:', error);
        return NextResponse.json({ error: error.message || 'Failed to initiate payment' }, { status: 500 });
    }
}
