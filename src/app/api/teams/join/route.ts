import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { secret_code, username, email, password } = await request.json();

        if (!secret_code || !username || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        // 1. Verify Team
        const teamResult = await db.execute({
            sql: 'SELECT * FROM teams WHERE secret_code = ?',
            args: [secret_code.toUpperCase()],
        });

        if (teamResult.rows.length === 0) {
            return NextResponse.json({ error: 'Team not found with this code' }, { status: 404 });
        }

        const team = teamResult.rows[0];

        // 2. Check if user already exists in this team
        const userCheck = await db.execute({
            sql: 'SELECT * FROM users WHERE email = ? AND team_id = ?',
            args: [email, team.id],
        });

        if (userCheck.rows.length > 0) {
            return NextResponse.json({ error: 'You are already a member of this team' }, { status: 400 });
        }

        // 3. Hash Password & Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        await db.execute({
            sql: 'INSERT INTO users (id, username, email, password, team_id) VALUES (?, ?, ?, ?, ?)',
            args: [userId, username, email, hashedPassword, team.id as string],
        });

        return NextResponse.json({
            user: { id: userId, username, email, team_id: team.id },
            team: { id: team.id, name: team.name, description: team.description, secret_code: team.secret_code, admin_id: team.admin_id }
        });
    } catch (error) {
        console.error('Error joining team:', error);
        return NextResponse.json({ error: 'Failed to join team' }, { status: 500 });
    }
}
