import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { name, description, admin_name, admin_email, admin_password, is_existing_user } = await request.json();

        if (!name || !admin_name || !admin_email) {
            return NextResponse.json({ error: 'Team name and admin details are required' }, { status: 400 });
        }

        // 1. Check existing user/plan for this email
        const existingUserResult = await db.execute({
            sql: 'SELECT id, password, plan_type, subscription_end FROM users WHERE email = ? LIMIT 1',
            args: [admin_email],
        });

        const existingUser = existingUserResult.rows[0];
        const planType = (existingUser?.plan_type as any) || 'free';

        // Check password if it's a new user or if password provided doesn't match existing (if we want that)
        // For simplicity and internal use, if is_existing_user is true, we use the old password
        let finalPassword = admin_password;
        if (is_existing_user && existingUser) {
            finalPassword = existingUser.password as string;
        } else if (!admin_password) {
            return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 });
        } else {
            finalPassword = await bcrypt.hash(admin_password, 10);
        }

        // Count how many teams this user (by email) is admin of
        const ownedTeamsResult = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM teams t JOIN users u ON t.admin_id = u.id WHERE u.email = ?',
            args: [admin_email],
        });

        const ownedCount = Number(ownedTeamsResult.rows[0].count);
        const maxTeams = planType === 'pro' ? 10 : 1;

        if (ownedCount >= maxTeams) {
            return NextResponse.json({
                error: `لقد وصلت للحد الأقصى من المشاريع (${ownedCount}/${maxTeams}). قم بالترقية للباقة الاحترافية لإنشاء المزيد.`
            }, { status: 403 });
        }

        const teamId = uuidv4();
        const userId = uuidv4();
        const secret_code = Math.random().toString(36).substring(2, 8).toUpperCase();

        // 1. Create Team (with admin_id)
        try {
            await db.execute({
                sql: 'INSERT INTO teams (id, name, description, secret_code, admin_id) VALUES (?, ?, ?, ?, ?)',
                args: [teamId, name, description || '', secret_code, userId],
            });
        } catch (teamError: any) {
            console.error('Database error creating team:', teamError);
            return NextResponse.json({ error: 'فشل في إنشاء الفريق في قاعدة البيانات', details: teamError.message }, { status: 500 });
        }

        // 2. Create Admin User (scopced to this team)
        const subEnd = existingUser?.subscription_end || null;

        try {
            await db.execute({
                sql: 'INSERT INTO users (id, username, email, password, team_id, plan_type, subscription_end) VALUES (?, ?, ?, ?, ?, ?, ?)',
                args: [userId, admin_name, admin_email, finalPassword, teamId, planType, subEnd],
            });
        } catch (userError: any) {
            console.error('Database error creating user:', userError);
            // If user creation fails, we should ideally delete the team we just created
            await db.execute({ sql: 'DELETE FROM teams WHERE id = ?', args: [teamId] });
            return NextResponse.json({ error: 'فشل في تسجيل بيانات المسؤول', details: userError.message }, { status: 500 });
        }

        return NextResponse.json({
            id: teamId,
            name,
            description,
            secret_code,
            admin_id: userId,
            user: { id: userId, username: admin_name, email: admin_email, team_id: teamId }
        });
    } catch (error: any) {
        console.error('Global Error creating team:', error);
        return NextResponse.json({ error: 'حدث خطأ مفاجئ أثناء إنشاء الفريق', details: error.message }, { status: 500 });
    }
}
