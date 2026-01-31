import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { secret_code, username, email, password } = await request.json();

        if (!secret_code || !email) {
            return NextResponse.json({ error: 'Email and Team Code are required' }, { status: 400 });
        }

        let hashedPassword = '';
        let finalUsername = username;

        // If username or password missing, check if user exists
        if (!username || !password) {
            const existingUserInfo = await db.execute({
                sql: 'SELECT username, password FROM users WHERE email = ? ORDER BY created_at DESC LIMIT 1',
                args: [email],
            });

            if (existingUserInfo.rows.length === 0) {
                return NextResponse.json({ error: 'المستخدم غير موجود. يرجى إدخال جميع البيانات للتسجيل لأول مرة.' }, { status: 400 });
            }

            finalUsername = username || (existingUserInfo.rows[0].username as string);
            hashedPassword = existingUserInfo.rows[0].password as string;
        } else {
            hashedPassword = await bcrypt.hash(password, 10);
            finalUsername = username;
        }

        // 1. Verify Team
        const teamResult = await db.execute({
            sql: 'SELECT * FROM teams WHERE secret_code = ?',
            args: [secret_code.toUpperCase()],
        });

        if (teamResult.rows.length === 0) {
            return NextResponse.json({ error: 'لم يتم العثور على فريق بهذا الكود' }, { status: 404 });
        }

        const team = teamResult.rows[0];

        // 2. Check if user already exists in this team
        const userCheck = await db.execute({
            sql: 'SELECT * FROM users WHERE email = ? AND team_id = ?',
            args: [email, team.id],
        });

        if (userCheck.rows.length > 0) {
            return NextResponse.json({ error: 'أنت عضو بالفعل في هذا الفريق' }, { status: 400 });
        }

        // 3. Check team member limits based on admin's plan
        const adminResult = await db.execute({
            sql: 'SELECT plan_type FROM users WHERE id = ?',
            args: [team.admin_id],
        });
        const planType = (adminResult.rows[0]?.plan_type as any) || 'free';

        const memberCountResult = await db.execute({
            sql: 'SELECT COUNT(*) as count FROM users WHERE team_id = ?',
            args: [team.id],
        });
        const currentMembers = Number(memberCountResult.rows[0].count);
        const maxMembers = planType === 'pro' ? 10 : 5;

        if (currentMembers >= maxMembers) {
            return NextResponse.json({
                error: `عذراً، وصل هذا الفريق للحد الأقصى من الأعضاء المسموح به في الباقة الحالية (${maxMembers} أعضاء).`
            }, { status: 403 });
        }

        // 4. Inherit user's existing plan if any
        const existingUserResult = await db.execute({
            sql: 'SELECT plan_type, subscription_end FROM users WHERE email = ? ORDER BY created_at DESC LIMIT 1',
            args: [email],
        });
        const userPlan = (existingUserResult.rows[0]?.plan_type as any) || 'free';
        const subEnd = existingUserResult.rows[0]?.subscription_end || null;

        // 5. Create User
        const userId = uuidv4();

        await db.execute({
            sql: 'INSERT INTO users (id, username, email, password, team_id, plan_type, subscription_end, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
            args: [userId, finalUsername, email, hashedPassword, team.id as string, userPlan, subEnd],
        });

        return NextResponse.json({
            user: { id: userId, username: finalUsername, email, team_id: team.id },
            team: { id: team.id, name: team.name, description: team.description, secret_code: team.secret_code, admin_id: team.admin_id }
        });
    } catch (error: any) {
        console.error('Error joining team:', error);
        return NextResponse.json({ error: error.message || 'Failed to join team' }, { status: 500 });
    }
}
