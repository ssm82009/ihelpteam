'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import { useStore, Task } from '@/lib/store';
import Column from './Column';
import TaskModal from './TaskModal';
import { Plus, Minus, Bold } from 'lucide-react';
import { toast } from 'react-hot-toast';


const AVAILABLE_COLORS: Record<string, any> = {
    blue: { color: 'bg-status-plan/10', textColor: 'text-status-plan', borderColor: 'border-status-plan/20' },
    orange: { color: 'bg-status-exec/10', textColor: 'text-status-exec', borderColor: 'border-status-exec/20' },
    purple: { color: 'bg-status-review/10', textColor: 'text-status-review', borderColor: 'border-status-review/20' },
    green: { color: 'bg-status-done/10', textColor: 'text-status-done', borderColor: 'border-status-done/20' },
    pink: { color: 'bg-purple-500/10', textColor: 'text-purple-600', borderColor: 'border-purple-500/20' },
    red: { color: 'bg-rose-500/10', textColor: 'text-rose-600', borderColor: 'border-rose-500/20' },
    yellow: { color: 'bg-amber-500/10', textColor: 'text-amber-600', borderColor: 'border-amber-500/20' },
    cyan: { color: 'bg-cyan-500/10', textColor: 'text-cyan-600', borderColor: 'border-cyan-500/20' },
};

export default function Board() {
    const { team, tasks, setTasks, updateTask, addTask, currentUser, setTeam, fontSize, setFontSize, isBold, setIsBold } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isAdmin = !!currentUser?.id && !!team?.admin_id && currentUser.id === team.admin_id;

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

    const fetchTeamInfo = async () => {
        try {
            if (!team?.id) return;
            const res = await fetch(`/api/teams/info?id=${team.id}`);
            if (res.ok) {
                const refreshedTeam = await res.json();
                setTeam(refreshedTeam);
            }
        } catch (e) {
            console.error('Failed to refresh team info', e);
        }
    };

    useEffect(() => {
        setIsClient(true);
        if (team?.id) {
            fetchTasks();
            fetchTeamInfo();
        }
    }, [team?.id]);

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

        // 1. Create a shallow copy of the tasks array
        const currentTasks = [...tasks];

        // 2. Find the task being moved
        const taskIndex = currentTasks.findIndex(t => t.id === draggableId);
        if (taskIndex === -1) return;

        // 3. Create a copy of the task with updated status (avoids mutation)
        const movedTask = { ...currentTasks[taskIndex], status: newStatus };

        // 4. Remove from current array
        currentTasks.splice(taskIndex, 1);

        // 5. Find insertion point
        // Since columns (except Plan) are filtered, we need to find where to put it
        const targetColumnId = destination.droppableId;
        const targetColumnTasks = targetColumnId === 'Plan'
            ? currentTasks
            : currentTasks.filter(t => t.status === targetColumnId);

        const targetTaskAtDestination = targetColumnTasks[destination.index];

        let finalIndex;
        if (targetTaskAtDestination) {
            finalIndex = currentTasks.indexOf(targetTaskAtDestination);
        } else {
            finalIndex = currentTasks.length;
        }

        // 6. Insert at calculated position
        currentTasks.splice(finalIndex, 0, movedTask);

        // 7. Update state
        setTasks(currentTasks);

        // API Call
        try {
            await fetch(`/api/tasks/${draggableId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (error) {
            toast.error('فشل تحديث حالة المهمة');
            fetchTasks(); // Revert on failure
        }
    };

    const handleCreateTask = async (status: Task['status'], title: string) => {
        if (!title.trim() || !team?.id) return;

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    status,
                    team_id: team.id,
                    user_id: currentUser?.id,
                    user_name: currentUser?.username
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

    const getColumnStyles = (columnId: string) => {
        const colorMap: Record<string, string> = {
            'Plan': team?.color_plan || 'blue',
            'Execution': team?.color_execution || 'orange',
            'Review': team?.color_review || 'purple',
            'Completed': team?.color_completed || 'green',
            'Notes': team?.color_notes || 'pink'
        };
        const colorId = colorMap[columnId];
        return AVAILABLE_COLORS[colorId] || AVAILABLE_COLORS.blue;
    };

    const COLUMNS = [
        { id: 'Plan', title: team?.title_plan || 'الخطة', ...getColumnStyles('Plan') },
        { id: 'Execution', title: team?.title_execution || 'جاري العمل', ...getColumnStyles('Execution') },
        { id: 'Review', title: team?.title_review || 'مراجعة', ...getColumnStyles('Review') },
        { id: 'Completed', title: team?.title_completed || 'مكتمل', ...getColumnStyles('Completed') },
        { id: 'Notes', title: team?.title_notes || 'ملاحظات', ...getColumnStyles('Notes') },
    ] as const;

    const handleUpdateColumnTitle = async (columnId: string, newTitle: string) => {
        if (!isAdmin || !team?.id) return;

        const fieldMap: Record<string, string> = {
            'Plan': 'title_plan',
            'Execution': 'title_execution',
            'Completed': 'title_completed',
            'Review': 'title_review',
            'Notes': 'title_notes'
        };

        const fieldName = fieldMap[columnId];
        if (!fieldName) return;

        // Optimistic Update
        setTeam({ ...team, [fieldName]: newTitle });

        try {
            const res = await fetch('/api/teams/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: team.id, [fieldName]: newTitle })
            });
            if (!res.ok) throw new Error();
            toast.success('تم تحديث عنوان العمود');
        } catch (e) {
            toast.error('فشل تحديث عنوان العمود');
            fetchTeamInfo(); // Revert
        }
    };

    const handleUpdateColumnColor = async (columnId: string, colorId: string) => {
        if (!isAdmin || !team?.id) return;

        const fieldMap: Record<string, string> = {
            'Plan': 'color_plan',
            'Execution': 'color_execution',
            'Review': 'color_review',
            'Completed': 'color_completed',
            'Notes': 'color_notes'
        };

        const fieldName = fieldMap[columnId];
        if (!fieldName) return;

        // Optimistic Update
        setTeam({ ...team, [fieldName]: colorId });

        try {
            const res = await fetch('/api/teams/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: team.id, [fieldName]: colorId })
            });
            if (!res.ok) throw new Error();
            toast.success('تم تحديث لون العمود');
        } catch (e) {
            toast.error('فشل تحديث لون العمود');
            fetchTeamInfo(); // Revert
        }
    };

    if (!isClient) {
        return (
            <div className="w-full h-[calc(100vh-80px)] overflow-y-auto md:overflow-x-auto bg-background transition-colors duration-300 px-4 md:px-8">
                <div className="flex flex-col md:flex-row xl:justify-center min-w-full py-6 md:py-8 gap-6 md:gap-6 items-center md:items-start">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-full md:flex-1 min-w-0 md:min-w-[280px] max-w-[450px] h-[400px] md:h-[80%] bg-muted/50 rounded-2xl animate-pulse shrink-0"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="h-[calc(100vh-80px)] overflow-y-auto md:overflow-hidden bg-background relative transition-colors duration-300">
                <div className="w-full h-full overflow-x-hidden md:overflow-x-auto custom-scrollbar px-4 md:px-8 xl:px-12">
                    <div className="flex flex-col md:flex-row min-w-full py-6 md:py-8 gap-8 md:gap-6 items-center md:items-start">
                        {COLUMNS.map((column) => (
                            <Column
                                key={column.id}
                                id={column.id}
                                title={column.title}
                                color={column.color}
                                textColor={column.textColor}
                                borderColor={column.borderColor}
                                tasks={column.id === 'Plan' ? tasks : tasks.filter((t) => t.status === column.id)}
                                onCreateTask={(title) => handleCreateTask(column.id as Task['status'], title)}
                                onTaskClick={openTask}
                                isAdmin={isAdmin}
                                onUpdateTitle={(newTitle) => handleUpdateColumnTitle(column.id, newTitle)}
                                onUpdateColor={(colorId) => handleUpdateColumnColor(column.id, colorId)}
                                team={team}
                            />
                        ))}
                    </div>
                </div>

                {isModalOpen && selectedTask && (
                    <TaskModal
                        task={selectedTask}
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}
            </div>
        </DragDropContext>
    );
}
