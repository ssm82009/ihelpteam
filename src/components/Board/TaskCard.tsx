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
                        className={`glass-card p-3 rounded-xl border-l-[3px] cursor-grab active:cursor-grabbing bg-white relative overflow-hidden transition-all ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 ring-2 ring-blue-400 inset-0' : 'hover:shadow-md'
                            } ${task.status === 'Plan' ? 'border-l-blue-400' :
                                task.status === 'Execution' ? 'border-l-yellow-400' :
                                    task.status === 'Completed' ? 'border-l-green-400' : 'border-l-purple-400'
                            }`}
                    >
                        {task.image_data && (
                            <div className="h-24 w-full mb-3 rounded-lg overflow-hidden relative bg-gray-100">
                                <img src={task.image_data} alt="" className="w-full h-full object-cover" />
                            </div>
                        )}

                        {isEditing ? (
                            <div className="flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
                                <textarea
                                    autoFocus
                                    className="w-full text-sm font-medium text-gray-800 p-2 bg-gray-50 rounded-lg border border-blue-200 outline-none resize-none"
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
                                <h3 className="text-gray-800 font-medium text-sm leading-relaxed pr-6">
                                    {task.title}
                                </h3>
                                {isAdmin && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsEditing(true);
                                        }}
                                        className="absolute top-0 right-0 p-1 opacity-0 group-hover/title:opacity-100 text-gray-400 hover:text-blue-600 transition-all rounded-md hover:bg-blue-50"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 font-medium pt-2 border-t border-gray-50">
                            <span className="opacity-60">#{task.id.slice(0, 4)}</span>

                            {(task.comment_count !== undefined && task.comment_count > 0) && (
                                <div className="flex items-center gap-1 text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full font-bold">
                                    <MessageSquare size={10} className="fill-blue-500/20" />
                                    <span>{task.comment_count}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </Draggable>
    );
}
