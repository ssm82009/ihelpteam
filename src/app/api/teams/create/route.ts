import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const { name, description } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
        }

        const id = uuidv4();
        const secret_code = Math.random().toString(36).substring(2, 8).toUpperCase();

        await db.execute({
            sql: 'INSERT INTO teams (id, name, description, secret_code) VALUES (?, ?, ?, ?)',
            args: [id, name, description || '', secret_code],
        });

        return NextResponse.json({ id, name, description, secret_code });
    } catch (error) {
        console.error('Error creating team:', error);
        return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }
}
