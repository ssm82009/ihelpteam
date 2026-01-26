import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    try {
        const info = await transporter.sendMail({
            from: `"مُساعد الفريق" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
}

export async function sendTaskNotification(to: string, taskTitle: string, status: string, teamName: string) {
    const statusMap: Record<string, string> = {
        'Plan': 'الخطة',
        'Execution': 'التنفيذ',
        'Completed': 'مكتمل',
        'Review': 'مراجعة'
    };

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; text-align: right; background-color: #f9fafb; padding: 40px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 16px; shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #4f46e5; margin-bottom: 20px;">تنبيه مهمة جديدة - ${teamName}</h2>
        <p style="font-size: 16px; color: #374151;">تمت إضافة مهمة جديدة في لوحة الفريق:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #111827;">${taskTitle}</p>
          <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">الحالة: ${statusMap[status] || status}</p>
        </div>
        <p style="font-size: 14px; color: #9ca3af;">يمكنك مراجعة لوحة المهام الآن لمتابعة التقدم.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="font-size: 12px; color: #d1d5db; text-align: center;">مُساعد الفريق - نظام الإدارة الذكي</p>
      </div>
    </div>
  `;

    return sendEmail({ to, subject: `مهمة جديدة: ${taskTitle}`, html });
}

export async function notifyTeamEvent(teamId: string, eventTitle: string, eventDetails: string) {
    // In a real app, we would fetch team member emails from the DB.
    // For this MVP, we can fetch all users in the team and send them an email.
    // Since we don't have user emails in the schema provided, I'll add a placeholder function
    // or use a default recipient if provided. 
    // However, the schema says "Users" table has ID, username, team_id but no email.
    // I should probably check if I can add an email field to users or just send to a fixed address for now.
    // The user asked to "use it in sending notifications of team events via email".

    console.log(`Notification for team ${teamId}: ${eventTitle} - ${eventDetails}`);
}
