import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request) {
    try {
        const { id, title_plan, title_execution, title_completed, title_review, title_notes } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
        }

        const updates = [];
        const args = [];

        if (title_plan !== undefined) {
            updates.push('title_plan = ?');
            args.push(title_plan);
        }
        if (title_execution !== undefined) {
            updates.push('title_execution = ?');
            args.push(title_execution);
        }
        if (title_completed !== undefined) {
            updates.push('title_completed = ?');
            args.push(title_completed);
        }
        if (title_review !== undefined) {
            updates.push('title_review = ?');
            args.push(title_review);
        }
        if (title_notes !== undefined) {
            updates.push('title_notes = ?');
            args.push(title_notes);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        args.push(id);

        await db.execute({
            sql: `UPDATE teams SET ${updates.join(', ')} WHERE id = ?`,
            args,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating team:', error);
        return NextResponse.json({ error: 'Failed to update team' }, { status: 500 });
    }
}
