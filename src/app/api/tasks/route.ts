import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendTaskNotification } from '@/lib/mail';

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

        // Notify team (Demo: notify the support email)
        if (process.env.SMTP_USER) {
            sendTaskNotification(process.env.SMTP_USER, title, status, user_name || "فريق العمل");
        }

        return NextResponse.json({ id, title, status, image_data, team_id, user_id, user_name, background_color });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
