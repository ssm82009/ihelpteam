
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { userId, teamId, taskId, type } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'UserID required' }, { status: 400 });
        }

        let sql = '';
        let args: any[] = [];

        if (taskId) {
            // Clear notifications for a specific task (viewing comments)
            // If type is provided, use it, otherwise assume clearing all for task
            sql = 'DELETE FROM pending_notifications WHERE user_id = ? AND task_id = ?';
            args = [userId, taskId];
        } else if (teamId && type === 'task_created') {
            // Clear "New Task" notifications for a specific team (viewing board)
            sql = 'DELETE FROM pending_notifications WHERE user_id = ? AND team_id = ? AND type = "task_created"';
            args = [userId, teamId];
        } else {
            return NextResponse.json({ error: 'Invalid parameters: Provide (userId, taskId) or (userId, teamId, type="task_created")' }, { status: 400 });
        }

        await db.execute({ sql, args });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
