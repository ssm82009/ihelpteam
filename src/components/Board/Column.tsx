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
    textColor: string;
    borderColor: string;
    tasks: Task[];
    onCreateTask: (title: string) => void;
    onTaskClick: (task: Task) => void;
    isAdmin: boolean;
    onUpdateTitle: (newTitle: string) => void;
}

export default function Column({ id, title, color, textColor, borderColor, tasks, onCreateTask, onTaskClick, isAdmin, onUpdateTitle }: ColumnProps) {
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
        <div className="min-w-[300px] w-[300px] max-h-full flex flex-col group/column transition-all duration-300 border border-gray-200 pb-4">
            {/* Column Header Capsule */}
            <div className={`p-2.5 mb-6 flex items-center justify-between rounded-none ${color} ${borderColor} border shadow-sm`}>
                <div className="flex items-center gap-3 flex-1 px-2">
                    {isEditingTitle && isAdmin ? (
                        <form onSubmit={handleTitleUpdate} className="flex-1">
                            <input
                                autoFocus
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onBlur={handleTitleUpdate}
                                className="w-full font-bold text-gray-800 bg-white/50 border border-blue-200 outline-none rounded-none px-3 py-0.5"
                            />
                        </form>
                    ) : (
                        <div className="flex items-center gap-2 group/title cursor-pointer w-full" onClick={() => isAdmin && setIsEditingTitle(true)}>
                            <h2 className={`font-black ${textColor} text-xs uppercase tracking-widest`}>{title}</h2>
                            <span className={`text-[10px] ${color} bg-white/80 ${textColor} px-2 py-0.5 rounded-none font-black shadow-sm`}>
                                {tasks.length}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1">
                    {isAdmin && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className={`p-1.5 hover:bg-white/40 rounded-none transition-colors ${textColor} opacity-60 hover:opacity-100`}
                        >
                            <Plus size={14} />
                        </button>
                    )}
                    <button className={`p-1.5 hover:bg-white/40 rounded-none transition-colors ${textColor} opacity-40 hover:opacity-100`}>
                        <Edit2 size={12} className="opacity-0" /> {/* Spacer or extra action */}
                    </button>
                </div>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 overflow-y-auto px-1 space-y-4 custom-scrollbar">
                <Droppable droppableId={id}>
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="min-h-[50px] space-y-4"
                        >
                            <AnimatePresence mode='popLayout'>
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
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onSubmit={handleSubmit}
                            className="bg-white p-4 rounded-none border border-gray-200 shadow-md ring-2 ring-blue-50"
                        >
                            <textarea
                                autoFocus
                                placeholder="ما الذي يجب فعله؟"
                                className="w-full text-sm font-bold resize-none outline-none text-gray-800 placeholder-gray-400 bg-transparent mb-3"
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
                                    className="px-3 py-1.5 hover:bg-gray-100 rounded-none text-gray-500 text-xs font-bold transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-black rounded-none hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                                >
                                    إضافة
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-4 flex items-center justify-center gap-2 text-gray-400 hover:text-blue-500 hover:bg-white rounded-none border-2 border-dashed border-gray-100 hover:border-blue-100 transition-all font-bold text-sm bg-gray-50/50"
                        >
                            <Plus size={18} />
                            <span>إضافة مهمة</span>
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
