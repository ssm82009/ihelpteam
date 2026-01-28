import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { email, plan_type } = await request.json();

        if (!email || !plan_type) {
            return NextResponse.json({ error: 'Email and plan type are required' }, { status: 400 });
        }

        const subscription_end = plan_type === 'pro'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : null;

        await db.execute({
            sql: 'UPDATE users SET plan_type = ?, subscription_end = ? WHERE email = ?',
            args: [plan_type, subscription_end, email],
        });

        return NextResponse.json({
            success: true,
            plan_type,
            subscription_end
        });
    } catch (error) {
        console.error('Error upgrading subscription:', error);
        return NextResponse.json({ error: 'Failed to upgrade subscription' }, { status: 500 });
    }
}
