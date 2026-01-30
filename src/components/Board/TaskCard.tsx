import { useState, forwardRef } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Task, useStore } from '@/lib/store';
import { motion } from 'framer-motion';
import { MessageSquare, Edit2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TaskCardProps {
    task: Task;
    index: number;
    onClick: () => void;
    isAdmin: boolean;
    isShadow?: boolean;
    team: any;
}

const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(({ task, index, onClick, isAdmin, isShadow, team }, ref) => {
    const { updateTask: updateStoreTask, fontSize, isBold } = useStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(task.title);

    const handleUpdateTitle = async (e: React.MouseEvent | React.FormEvent) => {
        e.stopPropagation();
        if (editedTitle.trim() === '' || editedTitle === task.title) {
            setIsEditing(false);
            setEditedTitle(task.title);
            return;
        }

        updateStoreTask(task.id, { title: editedTitle });
        setIsEditing(false);

        try {
            const res = await fetch(`/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editedTitle }),
            });
            if (!res.ok) throw new Error();
            toast.success('تم تحديث العنوان');
        } catch (error) {
            toast.error('فشل تحديث العنوان');
            updateStoreTask(task.id, { title: task.title });
            setEditedTitle(task.title);
        }
    };

    const cardContent = (
        <motion.div
            layoutId={isShadow ? `shadow-${task.id}` : task.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
                filter: isShadow ? 'grayscale(100%)' : 'none',
                opacity: isShadow ? 0.6 : 1
            }}
            className={`p-4 rounded-xl border border-border border-l-[6px] transition-all duration-200 relative overflow-hidden glass-card ${isShadow ? 'border-l-muted-foreground/30 border-dashed cursor-default' :
                `cursor-grab active:cursor-grabbing ${task.status === 'Plan' ? 'border-l-status-plan' :
                    task.status === 'Execution' ? 'border-l-status-exec' :
                        task.status === 'Review' ? 'border-l-status-review' : 'border-l-status-done'
                }`
                }`}
        >
            {task.image_data && !isShadow && (
                <div className="h-32 w-full mb-4 rounded-lg overflow-hidden relative bg-muted/30">
                    <img src={task.image_data} alt="" className="w-full h-full object-cover" />
                </div>
            )}

            {isEditing ? (
                <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                    <textarea
                        autoFocus
                        className="w-full text-foreground p-2 bg-muted/20 rounded-lg border border-primary/20 outline-none resize-none"
                        style={{
                            fontSize: `${fontSize}px`,
                            fontWeight: isBold ? 'bold' : 'normal'
                        }}
                        rows={2}
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={handleUpdateTitle}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleUpdateTitle(e as any);
                            }
                            if (e.key === 'Escape') {
                                setIsEditing(false);
                                setEditedTitle(task.title);
                            }
                        }}
                    />
                </div>
            ) : (
                <div className="relative group/title">
                    <h3
                        className="text-foreground leading-relaxed mb-3 pr-6"
                        style={{
                            fontSize: `${fontSize}px`,
                            fontWeight: isBold ? 'bold' : 'normal'
                        }}
                    >
                        {task.title}
                    </h3>
                    {isAdmin && !isShadow && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            className="absolute top-0 right-0 p-1 opacity-0 group-hover/title:opacity-100 text-muted-foreground hover:text-primary transition-all rounded-lg"
                        >
                            <Edit2 size={14} />
                        </button>
                    )}
                </div>
            )}

            <div className="mt-2 flex flex-row-reverse items-center justify-between pt-3 border-t border-border/50">
                <div className="flex items-center gap-2">
                    {task.user_name && (
                        <div
                            className="w-6 h-6 rounded-md bg-muted border border-border shadow-sm flex items-center justify-center text-[10px] text-muted-foreground font-black"
                            title={task.user_name}
                        >
                            {task.user_name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="hidden">#{task.id.slice(0, 6).toUpperCase()}</span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${task.status === 'Plan' ? 'bg-status-plan/20 text-status-plan' :
                        task.status === 'Execution' ? 'bg-status-exec/20 text-status-exec' :
                            task.status === 'Review' ? 'bg-status-review/20 text-status-review' :
                                task.status === 'Notes' ? 'bg-purple-500/20 text-purple-600' : 'bg-status-done/20 text-status-done'
                        }`}>
                        {task.status === 'Plan' ? (team?.title_plan || 'الخطة') :
                            task.status === 'Execution' ? (team?.title_execution || 'جاري') :
                                task.status === 'Review' ? (team?.title_review || 'مراجعة') :
                                    task.status === 'Completed' ? (team?.title_completed || 'مكتمل') : (team?.title_notes || 'ملاحظات')}
                    </span>
                    {(task.comment_count !== undefined && task.comment_count > 0) && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <MessageSquare size={12} />
                            <span className="text-[10px] font-bold">{task.comment_count}</span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Left side empty */}
                </div>
            </div>
        </motion.div>
    );

    if (isShadow) {
        return (
            <div ref={ref} className="mb-3 grayscale opacity-60 pointer-events-none">
                {cardContent}
            </div>
        );
    }

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={(el) => {
                        provided.innerRef(el);
                        if (typeof ref === 'function') ref(el);
                        else if (ref) ref.current = el;
                    }}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className={`mb-3 group outline-none ${snapshot.isDragging ? 'z-50 shadow-2xl rotate-1 scale-105 ring-2 ring-blue-100' : ''}`}
                    onClick={() => !isEditing && onClick()}
                >
                    {cardContent}
                </div>
            )}
        </Draggable>
    );
});

TaskCard.displayName = 'TaskCard';

export default TaskCard;
