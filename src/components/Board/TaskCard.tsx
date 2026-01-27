'use client';

import { useState } from 'react';
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
}

export default function TaskCard({ task, index, onClick, isAdmin }: TaskCardProps) {
    const { updateTask: updateStoreTask } = useStore();
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

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className={`mb-3 group outline-none ${snapshot.isDragging ? 'z-50' : ''}`}
                    onClick={() => !isEditing && onClick()}
                >
                    <motion.div
                        layoutId={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        style={{ backgroundColor: task.background_color || 'white' }}
                        className={`p-4 rounded-none border border-gray-200 border-l-[6px] cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden ${snapshot.isDragging ? 'shadow-2xl rotate-1 scale-105 ring-2 ring-blue-100' : ''
                            } ${task.status === 'Plan' ? 'border-l-[#BCCCDC]' :
                                task.status === 'Execution' ? 'border-l-[#F9E4C5]' :
                                    task.status === 'Review' ? 'border-l-[#E2D6F5]' : 'border-l-[#D6EBE0]'
                            }`}
                    >
                        {task.image_data && (
                            <div className="h-32 w-full mb-4 rounded-none overflow-hidden relative bg-gray-50">
                                <img src={task.image_data} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}

                        {isEditing ? (
                            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                <textarea
                                    autoFocus
                                    className="w-full text-base font-bold text-gray-800 p-2 bg-gray-50 rounded-none border border-blue-200 outline-none resize-none"
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
                                <h3 className="text-gray-800 font-bold text-base leading-tight mb-3 pr-6">
                                    {task.title}
                                </h3>
                                {isAdmin && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsEditing(true);
                                        }}
                                        className="absolute top-0 right-0 p-1 opacity-0 group-hover/title:opacity-100 text-gray-300 hover:text-blue-500 transition-all rounded-none"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Labels/Tags area - visible in the image */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-none ${task.status === 'Plan' ? 'bg-blue-50 text-blue-600' :
                                task.status === 'Execution' ? 'bg-orange-50 text-orange-600' :
                                    task.status === 'Review' ? 'bg-purple-50 text-purple-600' : 'bg-green-50 text-green-600'
                                }`}>
                                {task.status === 'Plan' ? 'تخطيط' :
                                    task.status === 'Execution' ? 'جاري' :
                                        task.status === 'Review' ? 'مراجعة' : 'مكتمل'}
                            </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between pt-3 border-t border-gray-100/80">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 font-mono tracking-tighter">#{task.id.slice(0, 6).toUpperCase()}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {(task.comment_count !== undefined && task.comment_count > 0) && (
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <MessageSquare size={12} />
                                        <span className="text-[10px] font-bold">{task.comment_count}</span>
                                    </div>
                                )}
                                {task.user_name && (
                                    <div
                                        className="w-6 h-6 rounded-none bg-indigo-500 border-2 border-white shadow-sm flex items-center justify-center text-[10px] text-white font-black"
                                        title={task.user_name}
                                    >
                                        {task.user_name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </Draggable>
    );
}
