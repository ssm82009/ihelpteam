import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendTaskNotification, sendBatchEmails } from '@/lib/mail';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const team_id = searchParams.get('team_id');

    if (!team_id) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    try {
        const result = await db.execute({
            sql: `
                SELECT t.*, COUNT(c.id) as comment_count 
                FROM tasks t 
                LEFT JOIN comments c ON t.id = c.task_id 
                WHERE t.team_id = ? 
                GROUP BY t.id 
                ORDER BY t.created_at DESC
            `,
            args: [team_id],
        });
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { title, status, image_data, team_id, user_id, user_name, user_image, background_color } = body;

        if (!title || !status || !team_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = uuidv4();
        await db.execute({
            sql: 'INSERT INTO tasks (id, title, status, image_data, team_id, user_id, user_name, user_image, background_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            args: [id, title, status, image_data || null, team_id, user_id || null, user_name || null, user_image || null, background_color || null],
        });

        // Notify team members
        if (process.env.SMTP_USER) {
            // Get team name
            const teamRes = await db.execute({
                sql: 'SELECT name FROM teams WHERE id = ?',
                args: [team_id]
            });
            const teamName = teamRes.rows[0]?.name || 'الفريق';

            // Get all OTHER team members emails AND IDs
            const membersRes = await db.execute({
                sql: 'SELECT id, email FROM users WHERE team_id = ? AND id != ?', // Exclude the creator
                args: [team_id, user_id]
            });

            const recipients = membersRes.rows.map((row: any) => row.email).filter((email: string) => email && email.includes('@'));

            // Insert pending notifications
            for (const member of membersRes.rows) {
                try {
                    await db.execute({
                        sql: 'INSERT INTO pending_notifications (id, user_id, task_id, team_id, comment_content, type) VALUES (?, ?, ?, ?, ?, ?)',
                        args: [uuidv4(), member.id, id, team_id, 'مهمة جديدة', 'task_created']
                    });
                } catch (e) { console.error('Failed to notify db', e); }
            }

            if (recipients.length > 0) {
                // We'll regenerate the HTML here to use the batch function properly, 
                // or we can loop sendTaskNotification. 
                // Let's use clean loop for now as we want to reuse the template logic in sendTaskNotification if possible,
                // but sendTaskNotification takes 1 email.
                // Let's construct the HTML once and send batch.

                const statusMap: Record<string, string> = {
                    'Plan': 'الخطة',
                    'Execution': 'جاري العمل',
                    'Completed': 'مكتمل',
                    'Review': 'مراجعة',
                    'Notes': 'ملاحظات'
                };

                const html = `
                    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f9fafb; padding: 40px;">
                      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">
                        <h2 style="color: #4f46e5; margin-bottom: 20px;">🔔 مهمة جديدة: ${teamName}</h2>
                        <p style="font-size: 16px; color: #374151;">قام <strong>${user_name || 'أحد الأعضاء'}</strong> بإضافة مهمة جديدة:</p>
                        
                        <div style="background-color: #f3f4f6; padding: 25px; border-radius: 12px; margin: 25px 0; border-right: 4px solid #4f46e5;">
                          <h3 style="margin: 0 0 10px 0; color: #111827; font-size: 18px;">${title}</h3>
                          <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: #6b7280; font-size: 14px;">القائمة:</span>
                            <span style="background-color: #e0e7ff; color: #4338ca; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold;">
                              ${statusMap[status] || status}
                            </span>
                          </div>
                        </div>
                        
                        <a href="${request.headers.get('origin') || 'https://ihelp.sa'}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                          فتح لوحة المهام 
                        </a>
                        
                        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                        <p style="font-size: 12px; color: #9ca3af; text-align: center;">تم الإرسال بواسطة iHelp - نظام إدارة الفرق الذكي</p>
                      </div>
                    </div>
                `;

                // Fire and forget (don't await to keep UI fast)
                sendBatchEmails(recipients, `مهمة جديدة: ${title}`, html).catch(err => console.error('Background email error:', err));

                // Also insert into pending_notifications for UI badge
                for (const member of membersRes.rows) {
                    const email = member.email as string;
                    if (!email) continue;

                    // We need user_id for the pending_notification.
                    // The previous query only selected email. Let's fetch ID too.
                }
            }
        }

        return NextResponse.json({ id, title, status, image_data, team_id, user_id, user_name, background_color });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
