import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const { status, title, image_data } = await request.json();

        const updates = [];
        const args = [];

        if (status) {
            updates.push('status = ?');
            args.push(status);
        }
        if (title) {
            updates.push('title = ?');
            args.push(title);
        }
        if (image_data !== undefined) {
            updates.push('image_data = ?');
            args.push(image_data);
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
        }

        args.push(id);

        await db.execute({
            sql: `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
            args,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }
}
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        // 1. Delete comments first
        await db.execute({
            sql: 'DELETE FROM comments WHERE task_id = ?',
            args: [id],
        });

        // 2. Delete task
        await db.execute({
            sql: 'DELETE FROM tasks WHERE id = ?',
            args: [id],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }
}
