import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

// Helper to get task details
async function getTaskDetails(taskId: string) {
    const res = await db.execute({
        sql: 'SELECT title, team_id, user_id, assigned_id FROM tasks WHERE id = ?',
        args: [taskId]
    });
    return res.rows[0];
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const task_id = searchParams.get('task_id');

    if (!task_id) {
        return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    try {
        const result = await db.execute({
            sql: `
                SELECT c.*, u.username, u.profile_image
                FROM comments c 
                LEFT JOIN users u ON c.user_id = u.id 
                WHERE c.task_id = ? 
                ORDER BY c.created_at ASC
            `,
            args: [task_id],
        });
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { task_id, user_id, content, type, media_data } = await request.json();

        if (!task_id || !user_id || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = uuidv4();
        const created_at = new Date().toISOString();

        await db.execute({
            sql: 'INSERT INTO comments (id, task_id, user_id, content, type, media_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [id, task_id, user_id, content || '', type, media_data || null, created_at],
        });

        // Get username for the response
        const userRes = await db.execute({
            sql: 'SELECT username FROM users WHERE id = ?',
            args: [user_id]
        });
        const username = userRes.rows[0]?.username || 'User';

        // ---------------------------------------------------------
        // NOTIFICATION LOGIC (For Digest)
        // ---------------------------------------------------------
        try {
            // 1. Get task details to know who to notify
            const task = await getTaskDetails(task_id);
            if (task) {
                const targets = new Set<string>();

                // Notify Task Creator (if not the one commenting)
                if (task.user_id && task.user_id !== user_id) {
                    targets.add(task.user_id as string);
                }

                // Notify Assigned User (if not the one commenting)
                if (task.assigned_id && task.assigned_id !== user_id) {
                    targets.add(task.assigned_id as string);
                }

                // Insert notifications
                for (const targetUserId of Array.from(targets)) {
                    await db.execute({
                        sql: 'INSERT INTO pending_notifications (id, user_id, task_id, team_id, comment_content, type) VALUES (?, ?, ?, ?, ?, ?)',
                        args: [uuidv4(), targetUserId, task_id, task.team_id, content?.substring(0, 100) || 'مرفق', 'new_comment']
                    });
                }
            }
        } catch (notifError) {
            console.error('Error queuing notification:', notifError);
            // Don't fail the request if notification queueing fails
        }

        return NextResponse.json({ id, task_id, user_id, username, content, type, media_data, created_at });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
