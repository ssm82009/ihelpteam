import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const result = await db.execute({
            sql: 'SELECT u.*, t.name as team_name, t.secret_code, t.admin_id FROM users u JOIN teams t ON u.team_id = t.id WHERE u.email = ?',
            args: [email],
        });

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const user = result.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password as string);

        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        return NextResponse.json({
            user: { id: user.id, username: user.username, email: user.email, team_id: user.team_id },
            team: { id: user.team_id, name: user.team_name, secret_code: user.secret_code, admin_id: user.admin_id }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
