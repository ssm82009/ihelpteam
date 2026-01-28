import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = '56eeer@gmail.com';

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json();

        if (email !== ADMIN_EMAIL) {
            return NextResponse.json({ error: 'غير مسموح' }, { status: 403 });
        }

        // Check code in DB
        const result = await db.execute({
            sql: 'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1',
            args: [email, code, new Date().toISOString()],
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'كود غير صحيح أو منتهي الصلاحية' }, { status: 400 });
        }

        const codeData = result.rows[0];

        // Mark as used
        await db.execute({
            sql: 'UPDATE verification_codes SET used = 1 WHERE id = ?',
            args: [codeData.id],
        });

        // Set session cookie
        const adminSecret = process.env.ADMIN_TOKEN_SECRET || 'fallback_secret';

        // For simplicity, we use the secret itself + email as a basic token check or just store a session.
        // In a production app, use JWT. For now, a signed cookie simulated by a secret is fine.
        const sessionToken = btoa(`${email}:${adminSecret}:${Date.now()}`);

        cookies().set('admin_session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in verify-otp:', error);
        return NextResponse.json({ error: 'فشل التحقق' }, { status: 500 });
    }
}
