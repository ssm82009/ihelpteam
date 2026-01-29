'use client';

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Task, useStore } from '@/lib/store';
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
    const { fontSize } = useStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);

    // Calculate dynamic font size for header (base it on the global fontSize + 4px for emphasis)
    const headerFontSize = fontSize + 4;

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
        <div className="w-[320px] md:w-[350px] shrink-0 max-h-full flex flex-col group/column transition-all duration-300 border border-border pb-4 column-container rounded-2xl">
            {/* Column Header Capsule */}
            <div className={`p-2.5 mb-6 flex items-center justify-between rounded-t-2xl ${color} ${borderColor} border-b shadow-sm`}>
                <div className="flex items-center gap-3 flex-1 px-2">
                    {isEditingTitle && isAdmin ? (
                        <form onSubmit={handleTitleUpdate} className="flex-1">
                            <input
                                autoFocus
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                onBlur={handleTitleUpdate}
                                style={{ fontSize: `${headerFontSize}px` }}
                                className="w-full font-bold text-foreground bg-background/50 border border-primary/20 outline-none rounded-lg px-3 py-0.5"
                            />
                        </form>
                    ) : (
                        <div className="flex items-center gap-2 group/title cursor-pointer w-full" onClick={() => isAdmin && setIsEditingTitle(true)}>
                            <div className={`w-3 h-3 rounded-full ${color.replace('/10', '')} mr-1`} />
                            <h2
                                className="font-black text-foreground tracking-wide"
                                style={{ fontSize: `${headerFontSize}px` }}
                            >
                                {title}
                            </h2>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <span className={`text-[11px] ${color} bg-background/80 ${textColor} px-2 py-0.5 rounded-lg font-black shadow-sm`}>
                        {tasks.length}
                    </span>
                    {isAdmin && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className={`p-1.5 hover:bg-background/40 rounded-lg transition-colors ${textColor} opacity-60 hover:opacity-100`}
                        >
                            <Plus size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 overflow-y-auto px-2 space-y-4 custom-scrollbar">
                <Droppable droppableId={id}>
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="min-h-[50px] space-y-4"
                        >
                            <AnimatePresence mode='popLayout'>
                                {tasks.map((task, index) => (
                                    <TaskCard
                                        key={task.id}
                                        task={task}
                                        index={index}
                                        onClick={() => onTaskClick(task)}
                                        isAdmin={isAdmin}
                                        isShadow={id === 'Plan' && task.status !== 'Plan'}
                                    />
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
                            className="bg-card p-4 rounded-xl border border-border shadow-md ring-2 ring-primary/5"
                        >
                            <textarea
                                autoFocus
                                placeholder="ما الذي يجب فعله؟"
                                className="w-full text-sm font-bold resize-none outline-none text-foreground placeholder-muted-foreground bg-transparent mb-3"
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
                                    className="px-3 py-1.5 hover:bg-muted rounded-lg text-muted-foreground text-xs font-bold transition-colors"
                                >
                                    إلغاء
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-black rounded-lg hover:opacity-90 transition shadow-lg shadow-primary/10"
                                >
                                    إضافة
                                </button>
                            </div>
                        </motion.form>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-4 flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:bg-card rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 transition-all font-bold text-sm"
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
