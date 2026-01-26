import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { name, description, admin_name, admin_email, admin_password } = await request.json();

        if (!name || !admin_name || !admin_email || !admin_password) {
            return NextResponse.json({ error: 'Team name and admin details are required' }, { status: 400 });
        }

        const teamId = uuidv4();
        const userId = uuidv4();
        const secret_code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // 1. Create Team (with admin_id)
        await db.execute({
            sql: 'INSERT INTO teams (id, name, description, secret_code, admin_id) VALUES (?, ?, ?, ?, ?)',
            args: [teamId, name, description || '', secret_code, userId],
        });

        // 2. Create Admin User
        const hashedPassword = await bcrypt.hash(admin_password, 10);

        await db.execute({
            sql: 'INSERT INTO users (id, username, email, password, team_id) VALUES (?, ?, ?, ?, ?)',
            args: [userId, admin_name, admin_email, hashedPassword, teamId],
        });

        return NextResponse.json({
            id: teamId,
            name,
            description,
            secret_code,
            admin_id: userId,
            user: { id: userId, username: admin_name, email: admin_email, team_id: teamId }
        });
    } catch (error) {
        console.error('Error creating team:', error);
        return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }
}
