import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';

export async function POST(request: Request) {
    try {
        const { to, subject, message } = await request.json();

        if (!to) {
            return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
        }

        const result = await sendEmail({
            to,
            subject: subject || 'تنبيه من مُساعد الفريق',
            html: `
        <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">مُساعد الفريق - تنبيه جديد</h2>
          <p>${message || 'هذا بريد تجريبي للتأكد من إعدادات خادم البريد.'}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">تم إرسال هذا البريد تلقائياً من تطبيق مُساعد الفريق.</p>
        </div>
      `,
        });

        if (result.success) {
            return NextResponse.json({ success: true, message: 'Email sent successfully' });
        } else {
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
