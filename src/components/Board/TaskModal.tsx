'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, useStore } from '@/lib/store';
import { X, Image as ImageIcon, Send, Clock, Play, Pause } from 'lucide-react';
import { toast } from 'react-hot-toast';
import VoiceRecorder from './VoiceRecorder';

interface TaskModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
}

interface Comment {
    id: string;
    task_id: string;
    content: string;
    type: 'text' | 'image' | 'voice';
    media_data?: string;
    created_at?: string;
}

export default function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
    const { updateTask } = useStore();
    const [title, setTitle] = useState(task.title);
    const [status, setStatus] = useState(task.status);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Image handling
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchComments();
        }
    }, [isOpen, task.id]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?task_id=${task.id}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const saveTitle = async () => {
        if (title === task.title) return;
        updateTask(task.id, { title });
        try {
            await fetch(`/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
        } catch (e) {
            toast.error('فشل حفظ العنوان');
        }
    };

    const handleStatusChange = async (newStatus: Task['status']) => {
        setStatus(newStatus);
        updateTask(task.id, { status: newStatus });
        try {
            await fetch(`/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
        } catch (e) {
            toast.error('فشل تحديث الحالة');
        }
    };

    const handleSendComment = async (type: 'text' | 'image' | 'voice', content: string = '', mediaData: string | null = null) => {
        if (!content && !mediaData) return;

        const optimisticComment: Comment = {
            id: 'temp-' + Date.now(),
            task_id: task.id,
            content,
            type,
            media_data: mediaData || undefined,
            created_at: new Date().toISOString()
        };

        setComments([...comments, optimisticComment]);
        setNewComment('');

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task_id: task.id,
                    content,
                    type,
                    media_data: mediaData
                })
            });

            if (!res.ok) throw new Error('Failed');
            const savedComment = await res.json();
            // replace optimistic
            setComments(prev => prev.map(c => c.id === optimisticComment.id ? savedComment : c));
        } catch (e) {
            toast.error('فشل إرسال التعليق');
            setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                handleSendComment('image', '', base64);
            };
            reader.readAsDataURL(file);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-end sm:justify-center pointer-events-none">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            <motion.div
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="pointer-events-auto bg-white/80 backdrop-blur-xl w-full sm:w-[500px] h-full shadow-2xl flex flex-col sm:rounded-l-3xl border-l border-white/50"
            >
                <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white/40">
                    <div className="flex-1">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={saveTitle}
                            className="text-xl font-bold bg-transparent outline-none w-full text-gray-800"
                            placeholder="عنوان المهمة"
                        />
                        <div className="flex gap-2 mt-2">
                            {(['Plan', 'Execution', 'Completed', 'Review'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${status === s
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-transparent text-gray-500 border-gray-200 hover:border-blue-300'
                                        }`}
                                >
                                    {s === 'Plan' ? 'الخطة' : s === 'Execution' ? 'التنفيذ' : s === 'Completed' ? 'مكتمل' : 'مراجعة'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {task.image_data && (
                        <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                            <img src={task.image_data} alt="Cover" className="w-full h-48 object-cover" />
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">التعليقات والنشاط</h3>
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment.id} className={`flex gap-3 ${comment.type === 'voice' ? 'items-center' : 'items-start'}`}>
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        U
                                    </div>
                                    <div className="flex-1 bg-white/60 p-3 rounded-2xl rounded-tr-none border border-gray-100 shadow-sm">
                                        {comment.type === 'text' && (
                                            <p className="text-sm text-gray-800">{comment.content}</p>
                                        )}
                                        {comment.type === 'image' && comment.media_data && (
                                            <img src={comment.media_data} alt="uploaded" className="rounded-lg max-h-48 object-cover" />
                                        )}
                                        {comment.type === 'voice' && comment.media_data && (
                                            <audio controls src={comment.media_data} className="h-8 w-full max-w-[200px]" />
                                        )}
                                        <span className="text-[10px] text-gray-400 mt-1 block">
                                            {comment.created_at ? new Date(comment.created_at).toLocaleTimeString('ar-SA') : 'الآن'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    لا توجد تعليقات بعد. كن أول من يعلق!
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-white border-t border-gray-100">
                    <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                        <VoiceRecorder onRecordingComplete={(data) => handleSendComment('voice', '', data)} />

                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                        >
                            <ImageIcon size={20} />
                        </button>

                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="اكتب تعليقاً..."
                            className="flex-1 bg-transparent outline-none text-sm resize-none py-2 max-h-24"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendComment('text', newComment);
                                }
                            }}
                        />

                        <button
                            onClick={() => handleSendComment('text', newComment)}
                            disabled={!newComment.trim()}
                            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
