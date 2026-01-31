
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendBatchEmails } from '@/lib/mail';

export const dynamic = 'force-dynamic'; // Ensure it's not cached

export async function GET(request: Request) {
    // Optional: Add a secret key check to prevent unauthorized triggering
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    // if (key !== process.env.CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        console.log('Starting digest notification job...');

        // 1. Get all pending notifications grouped by user
        const pendingResult = await db.execute(`
            SELECT 
                pn.user_id, 
                u.email, 
                u.username,
                COUNT(pn.id) as count,
                GROUP_CONCAT(DISTINCT pn.team_id) as team_ids
            FROM pending_notifications pn
            JOIN users u ON pn.user_id = u.id
            GROUP BY pn.user_id
        `);

        if (pendingResult.rows.length === 0) {
            return NextResponse.json({ message: 'No pending notifications found.' });
        }

        const reports = pendingResult.rows;
        const sentUserIds = [];

        console.log(`Found ${reports.length} users with pending notifications.`);

        // 2. Send emails
        for (const report of reports) {
            const email = report.email as string;
            if (!email || !email.includes('@')) continue;

            const count = report.count;
            const username = report.username as string;

            const html = `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f9fafb; padding: 40px;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 16px; border: 1px solid #e5e7eb;">
                    <h2 style="color: #4f46e5; margin-bottom: 20px;">👋 مرحباً ${username}</h2>
                    <p style="font-size: 16px; color: #374151;">لديك <strong>${count}</strong> ردود أو تحديثات جديدة غير مقروءة في مشاريعك.</p>
                    
                    <div style="background-color: #eef2ff; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;">
                        <p style="margin: 0; color: #4338ca; font-weight: bold; font-size: 18px;">
                        ملخص التحديثات
                        </p>
                        <p style="margin: 5px 0 0 0; color: #6366f1;">
                        هناك تفاعل نشط في مهامك المعلقة
                        </p>
                    </div>

                    <a href="https://ihelp.sa" style="display: block; width: 100%; text-align: center; background-color: #4f46e5; color: white; padding: 14px 0; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        الانتقال للوحة المهام
                    </a>
                    
                    <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center;">
                        تصلك هذه الرسالة لأنك طلبت ملخصاً دورياً للتنبيهات.
                    </p>
                    </div>
                </div>
            `;

            try {
                // Send individually to personalize
                await sendBatchEmails([email], `لديك ${count} تحديثات جديدة`, html);
                sentUserIds.push(report.user_id);
            } catch (err) {
                console.error(`Failed to send digest to ${email}`, err);
            }
        }

        // 3. Delete processed notifications
        if (sentUserIds.length > 0) {
            // Create placeholders for IN clause: ?, ?, ?
            const placeholders = sentUserIds.map(() => '?').join(',');
            await db.execute({
                sql: `DELETE FROM pending_notifications WHERE user_id IN (${placeholders})`,
                args: sentUserIds
            });
        }

        return NextResponse.json({
            success: true,
            sent_count: sentUserIds.length,
            users: sentUserIds
        });

    } catch (error: any) {
        console.error('Digest job error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
