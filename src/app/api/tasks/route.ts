import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const team_id = searchParams.get('team_id');

    if (!team_id) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
    }

    try {
        const result = await db.execute({
            sql: 'SELECT * FROM tasks WHERE team_id = ? ORDER BY created_at DESC',
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
        const { title, status, image_data, team_id } = body;

        if (!title || !status || !team_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const id = uuidv4();
        await db.execute({
            sql: 'INSERT INTO tasks (id, title, status, image_data, team_id) VALUES (?, ?, ?, ?, ?)',
            args: [id, title, status, image_data || null, team_id],
        });

        return NextResponse.json({ id, title, status, image_data, team_id });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }
}
