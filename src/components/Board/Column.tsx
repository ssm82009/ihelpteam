'use client';

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Task } from '@/lib/store';
import TaskCard from './TaskCard';
import { Plus, X, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ColumnProps {
    id: string;
    title: string;
    color: string;
    tasks: Task[];
    onCreateTask: (title: string) => void;
    onTaskClick: (task: Task) => void;
    isAdmin: boolean;
    onUpdateTitle: (newTitle: string) => void;
}

export default function Column({ id, title, color, tasks, onCreateTask, onTaskClick, isAdmin, onUpdateTitle }: ColumnProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) {
            onCreateTask(newTaskTitle);
            setNewTaskTitle('');
            setIsAdding(false);
        }
    };

    const handleTitleUpdate = (e: React.FormEvent | React.FocusEvent) => {
        e.preventDefault();
        if (editedTitle.trim() && editedTitle !== title) {
            onUpdateTitle(editedTitle);
        }
        setIsEditingTitle(false);
    };

    return (
        <div className={`glass-panel min-w-[320px] w-[320px] max-h-full flex flex-col rounded-2xl border-t-4 ${color}`}>
            <div className="p-4 flex items-center justify-between sticky top-0 bg-inherit rounded-t-2xl z-10 glass-panel border-0 border-b">
                <div className="flex items-center gap-2 flex-1">
                    {isEditingTitle && isAdmin ? (
                        <form onSubmit={handleTitleUpdate} className="flex-1">
                            <input
                                autoFocus
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onBlur={handleTitleUpdate}
                                className="w-full font-bold text-gray-700 bg-white/50 border border-blue-200 outline-none rounded px-1"
                            />
                        </form>
                    ) : (
                        <div className="flex items-center gap-2 group/title cursor-pointer" onClick={() => isAdmin && setIsEditingTitle(true)}>
                            <h2 className="font-bold text-gray-700">{title}</h2>
                            {isAdmin && <Edit2 size={10} className="text-gray-400 opacity-0 group-hover/title:opacity-100 transition-opacity" />}
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                                {tasks.length}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                <Droppable droppableId={id}>
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="min-h-[10px]"
                        >
                            <AnimatePresence>
                                {tasks.map((task, index) => (
                                    <TaskCard key={task.id} task={task} index={index} onClick={() => onTaskClick(task)} isAdmin={isAdmin} />
                                ))}
                            </AnimatePresence>
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>

                {isAdmin && (
                    isAdding ? (
                        <motion.form
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit}
                            className="bg-white p-3 rounded-xl border border-blue-200 shadow-sm"
                        >
                            <textarea
                                autoFocus
                                placeholder="عنوان المهمة..."
                                className="w-full text-sm resize-none outline-none text-gray-700 placeholder-gray-400 bg-transparent mb-2"
                                rows={2}
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-500"
                                >
                                    <X size={16} />
                                </button>
                                <button
                                    type="submit"
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
                                >
                                    إضافة
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-2.5 flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-transparent hover:border-blue-100 transition-all font-medium text-sm group"
                        >
                            <Plus size={18} className="group-hover:scale-110 transition-transform" />
                            إضافة مهمة جديدة
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
