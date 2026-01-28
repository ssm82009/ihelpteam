import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function GET() {
    if (!isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Basic Stats
        const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
        const teamCount = await db.execute('SELECT COUNT(*) as count FROM teams');
        const taskCount = await db.execute('SELECT COUNT(*) as count FROM tasks');

        // 2. Plan Stats
        const planStats = await db.execute('SELECT plan_type, COUNT(*) as count FROM users GROUP BY plan_type');

        // 3. Teams with member counts
        const teams = await db.execute(`
            SELECT t.*, (SELECT COUNT(*) FROM users u WHERE u.team_id = t.id) as members_count 
            FROM teams t
            ORDER BY members_count DESC
            LIMIT 20
        `);

        // 4. Recent Users
        const recentUsers = await db.execute('SELECT id, username, email, plan_type FROM users ORDER BY id DESC LIMIT 20');

        return NextResponse.json({
            stats: {
                users: userCount.rows[0].count,
                teams: teamCount.rows[0].count,
                tasks: taskCount.rows[0].count
            },
            planStats: planStats.rows,
            teams: teams.rows,
            recentUsers: recentUsers.rows
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
