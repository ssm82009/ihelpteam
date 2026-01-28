import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/mail';

const ADMIN_EMAIL = '56eeer@gmail.com';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (email !== ADMIN_EMAIL) {
            return NextResponse.json({ error: 'غير مسموح لهذا البريد بالدخول' }, { status: 403 });
        }

        // Generate 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save to DB
        await db.execute({
            sql: 'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)',
            args: [email, code, expiresAt.toISOString()],
        });

        // Send Email
        const html = `
            <div style="font-family: sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2563eb;">رقم التحقق للوحة التحكم</h2>
                <p>طلب جديد لتسجيل دخول مشرف الموقع.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e40af;">
                    ${code}
                </div>
                <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">هذا الكود صالح لمدة 10 دقائق فقط.</p>
            </div>
        `;

        await sendEmail({
            to: email,
            subject: 'كود التحقق الخاص بمشرف iHelp',
            html
        });

        return NextResponse.json({ success: true, message: 'تم إرسال الكود بنجاح' });
    } catch (error) {
        console.error('Error in send-otp:', error);
        return NextResponse.json({ error: 'فشل في إرسال الكود' }, { status: 500 });
    }
}
