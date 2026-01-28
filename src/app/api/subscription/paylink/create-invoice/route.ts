import { NextResponse } from 'next/server';
import { PaylinkService } from '@/lib/paylink';
import { PLANS } from '@/lib/plans';

export async function POST(request: Request) {
    try {
        const { email, username, planType } = await request.json();

        if (!email || !planType || !PLANS[planType as keyof typeof PLANS]) {
            return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
        }

        const plan = PLANS[planType as keyof typeof PLANS];
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const invoice = await PaylinkService.createInvoice({
            amount: plan.price,
            clientName: username || email,
            clientEmail: email,
            clientMobile: '0500000000', // Default or user provided
            callbackUrl: `${baseUrl}/api/subscription/paylink/callback?orderId=${orderNumber}&email=${encodeURIComponent(email)}&plan=${planType}`,
            cancelUrl: `${baseUrl}/?error=payment_cancelled`,
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
