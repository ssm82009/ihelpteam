'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useStore, Task } from '@/lib/store';
import Column from './Column';
import TaskModal from './TaskModal';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLUMNS = [
    { id: 'Plan', title: 'الخطة', color: 'bg-blue-50' },
    { id: 'Execution', title: 'التنفيذ', color: 'bg-yellow-50' },
    { id: 'Completed', title: 'مكتمل', color: 'bg-green-50' },
    { id: 'Review', title: 'مراجعة', color: 'bg-purple-50' },
] as const;

export default function Board() {
    const { team, tasks, setTasks, updateTask, addTask } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (team?.id) {
            fetchTasks();
        }
    }, [team?.id]);

    const fetchTasks = async () => {
        try {
            if (!team?.id) return;
            const res = await fetch(`/api/tasks?team_id=${team.id}`);
            if (!res.ok) throw new Error('Failed to fetch tasks');
            const data = await res.json();
            setTasks(data);
        } catch (error) {
            console.error(error);
            toast.error('فشل تحميل المهام');
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as Task['status'];

        // Optimistic Update
        updateTask(draggableId, { status: newStatus });

        // API Call
        try {
            await fetch(`/api/tasks/${draggableId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (error) {
            toast.error('فشل تحديث حالة المهمة');
            // Revert logic could be added here
            fetchTasks();
        }
    };

    const handleCreateTask = async (status: Task['status'], title: string) => {
        if (!title.trim() || !team?.id) return;

        // Create optimistic task
        const tempId = 'temp-' + Date.now();
        const optimisticTask: Task = {
            id: tempId,
            title,
            status,
            team_id: team.id,
            created_at: new Date().toISOString()
        };

        // We don't add optimistic task to store immediately because we want the real ID from DB for further interactions
        // But for better UX we could. For now let's just wait for API.

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    status,
                    team_id: team.id
                })
            });

            if (!res.ok) throw new Error('Failed');
            const newTask = await res.json();

            addTask(newTask);
            toast.success('تم إضافة المهمة');
        } catch (error) {
            toast.error('فشل إضافة المهمة');
        }
    };

    const openTask = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    if (!isClient) {
        return (
            <div className="flex p-6 gap-6 h-[calc(100vh-80px)] overflow-x-auto">
                {COLUMNS.map(col => (
                    <div key={col.id} className="min-w-[300px] bg-gray-100/50 rounded-2xl animate-pulse"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] overflow-x-auto overflow-y-hidden bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50">
            <div className="flex px-8 py-8 gap-8 h-full min-w-max items-start">
                <DragDropContext onDragEnd={onDragEnd}>
                    {COLUMNS.map((column) => (
                        <Column
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            color={column.color}
                            tasks={tasks.filter((t) => t.status === column.id)}
                            onCreateTask={(title) => handleCreateTask(column.id as Task['status'], title)}
                            onTaskClick={openTask}
                        />
                    ))}
                </DragDropContext>
            </div>

            {isModalOpen && selectedTask && (
                <TaskModal
                    task={selectedTask}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}
