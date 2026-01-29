'use client';

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Task, useStore } from '@/lib/store';
import TaskCard from './TaskCard';
import { Plus, X, Edit2, Palette } from 'lucide-react';
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
    onUpdateColor: (colorId: string) => void;
}

const AVAILABLE_COLORS = [
    { id: 'blue', color: 'bg-status-plan/10', textColor: 'text-status-plan', borderColor: 'border-status-plan/20', preview: 'bg-blue-500' },
    { id: 'orange', color: 'bg-status-exec/10', textColor: 'text-status-exec', borderColor: 'border-status-exec/20', preview: 'bg-orange-500' },
    { id: 'purple', color: 'bg-status-review/10', textColor: 'text-status-review', borderColor: 'border-status-review/20', preview: 'bg-purple-500' },
    { id: 'green', color: 'bg-status-done/10', textColor: 'text-status-done', borderColor: 'border-status-done/20', preview: 'bg-emerald-500' },
    { id: 'pink', color: 'bg-purple-500/10', textColor: 'text-purple-600', borderColor: 'border-purple-500/20', preview: 'bg-pink-500' },
    { id: 'red', color: 'bg-rose-500/10', textColor: 'text-rose-600', borderColor: 'border-rose-500/20', preview: 'bg-rose-500' },
    { id: 'yellow', color: 'bg-amber-500/10', textColor: 'text-amber-600', borderColor: 'border-amber-500/20', preview: 'bg-amber-500' },
    { id: 'cyan', color: 'bg-cyan-500/10', textColor: 'text-cyan-600', borderColor: 'border-cyan-500/20', preview: 'bg-cyan-500' },
];

export default function Column({ id, title, color, textColor, borderColor, tasks, onCreateTask, onTaskClick, isAdmin, onUpdateTitle, onUpdateColor }: ColumnProps) {
    const { fontSize } = useStore();
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);
    const [showColorPicker, setShowColorPicker] = useState(false);

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
        <div className="w-full md:flex-1 min-w-0 md:min-w-[280px] max-w-[450px] shrink-0 h-fit md:max-h-full flex flex-col group/column transition-all duration-300 border border-border pb-4 column-container rounded-2xl">
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
                        <div className="relative">
                            <button
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                className={`p-1.5 hover:bg-background/40 rounded-lg transition-colors ${textColor} opacity-60 hover:opacity-100`}
                            >
                                <Palette size={14} />
                            </button>
                            <AnimatePresence>
                                {showColorPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                        className="absolute top-full left-0 md:left-auto md:right-0 mt-2 p-2.5 bg-card border border-border rounded-2xl shadow-2xl z-[150] min-w-[140px] flex flex-wrap gap-2 justify-center"
                                    >
                                        {AVAILABLE_COLORS.map((c) => (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    onUpdateColor(c.id);
                                                    setShowColorPicker(false);
                                                }}
                                                className={`w-5 h-5 rounded-full ${c.preview} border border-white/40 hover:scale-125 transition-all shadow-sm cursor-pointer`}
                                                title={c.id}
                                            />
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
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
                            <span>إضافة</span>
                        </button>
                    )
                )}
            </div>
        </div>
    );
}
