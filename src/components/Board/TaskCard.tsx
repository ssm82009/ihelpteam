'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Task } from '@/lib/store';
import { motion } from 'framer-motion';

interface TaskCardProps {
    task: Task;
    index: number;
    onClick: () => void;
}

export default function TaskCard({ task, index, onClick }: TaskCardProps) {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className={`mb-3 group outline-none ${snapshot.isDragging ? 'z-50' : ''}`}
                    onClick={onClick}
                >
                    <motion.div
                        layoutId={task.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`glass-card p-3 rounded-xl border-l-[3px] cursor-grab active:cursor-grabbing bg-white relative overflow-hidden ${snapshot.isDragging ? 'shadow-2xl rotate-2 scale-105 ring-2 ring-blue-400 inset-0' : 'hover:shadow-md'
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

                        <h3 className="text-gray-800 font-medium text-sm leading-relaxed pointer-events-none select-none">
                            {task.title}
                        </h3>

                        <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400 font-medium pointer-events-none">
                            <span>#{task.id.slice(0, 4)}</span>
                            {/* Can add more metadata here like comment count */}
                        </div>
                    </motion.div>
                </div>
            )}
        </Draggable>
    );
}
