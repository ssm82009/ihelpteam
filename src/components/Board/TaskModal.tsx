'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, useStore } from '@/lib/store';
import { X, Image as ImageIcon, Send, Trash2 } from 'lucide-react';
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
    user_id: string;
    username: string;
    content: string;
    type: 'text' | 'image' | 'voice';
    media_data?: string;
    created_at?: string;
}

export default function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
    const { updateTask, currentUser, team, setTasks, tasks } = useStore();
    const [title, setTitle] = useState(task.title);
    const [status, setStatus] = useState(task.status);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isAdmin = !!currentUser?.id && !!team?.admin_id && currentUser.id === team.admin_id;

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchComments();
            setTitle(task.title);
            setStatus(task.status);
        }
    }, [isOpen, task.id, task.title, task.status]);

    const fetchComments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/comments?task_id=${task.id}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const saveTitle = async () => {
        if (!isAdmin || title === task.title) return;
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

    const handleDeleteTask = async () => {
        if (!isAdmin) return;
        if (!confirm('هل أنت متأكد من حذف هذه المهمة نهائياً؟')) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');

            setTasks(tasks.filter(t => t.id !== task.id));
            toast.success('تم حذف المهمة');
            onClose();
        } catch (e) {
            toast.error('فشل حذف المهمة');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleStatusChange = async (newStatus: Task['status']) => {
        if (!isAdmin) return;
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
        if (!currentUser) return;

        const optimisticComment: Comment = {
            id: 'temp-' + Date.now(),
            task_id: task.id,
            user_id: currentUser.id,
            username: currentUser.username,
            content,
            type,
            media_data: mediaData || undefined,
            created_at: new Date().toISOString()
        };

        setComments(prev => [...prev, optimisticComment]);
        setNewComment('');

        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    task_id: task.id,
                    user_id: currentUser.id,
                    content,
                    type,
                    media_data: mediaData
                })
            });

            if (!res.ok) throw new Error('Failed');
            const savedComment = await res.json();
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

    const getAvatarColor = (name: string) => {
        const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-orange-500'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
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
                            readOnly={!isAdmin}
                            className={`text-2xl font-black bg-transparent outline-none w-full text-gray-800 ${!isAdmin ? 'cursor-default' : ''}`}
                            placeholder="عنوان المهمة"
                        />
                        {isAdmin && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {(['Plan', 'Execution', 'Review', 'Completed'] as const).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleStatusChange(s)}
                                        className={`text-sm px-3 py-1.5 rounded-full border transition-all font-bold ${status === s
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300'
                                            }`}
                                    >
                                        {s === 'Plan' ? 'تخطيط' : s === 'Execution' ? 'جاري العمل' : s === 'Review' ? 'مراجعة' : 'مكتمل'}
                                    </button>
                                ))}
                            </div>
                        )}

                        {isAdmin && (
                            <div className="flex items-center gap-2 mt-4">
                                <span className="text-xs font-bold text-gray-400 ml-2">لون الخلفية:</span>
                                {[
                                    '#ffffff', // White
                                    '#f0f9ff', // Light Blue
                                    '#fdf2f8', // Light Pink
                                    '#f0fdf4', // Light Green
                                    '#fffbeb', // Light Yellow
                                    '#faf5ff', // Light Purple
                                    '#fff1f2', // Light Red
                                ].map((color) => (
                                    <button
                                        key={color}
                                        onClick={async () => {
                                            updateTask(task.id, { background_color: color });
                                            try {
                                                await fetch(`/api/tasks/${task.id}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ background_color: color })
                                                });
                                            } catch (e) {
                                                toast.error('فشل حفظ اللون');
                                            }
                                        }}
                                        className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${task.background_color === color || (!task.background_color && color === '#ffffff') ? 'ring-2 ring-blue-500 ring-offset-2' : 'border-gray-200'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <button
                                onClick={handleDeleteTask}
                                disabled={isDeleting}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                title="حذف المهمة"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {task.image_data && (
                        <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                            <img src={task.image_data} alt="Cover" className="w-full h-48 object-cover" />
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-right">التعليقات والنشاط</h3>
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className={`flex gap-3 ${comment.user_id === currentUser?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(comment.username || '؟')} flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm ring-2 ring-white`}>
                                        {(comment.username || '؟').charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`flex flex-col max-w-[80%] ${comment.user_id === currentUser?.id ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[10px] font-bold text-gray-500 mb-1 px-1">{comment.username || 'عضو سابق'}</span>
                                        <div className={`p-3 rounded-2xl border shadow-sm ${comment.user_id === currentUser?.id
                                            ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none text-right'
                                            : 'bg-white text-gray-800 border-gray-100 rounded-tl-none text-right'
                                            }`}>
                                            {comment.type === 'text' && (
                                                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                            )}
                                            {comment.type === 'image' && comment.media_data && (
                                                <img src={comment.media_data} alt="uploaded" className="rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(comment.media_data)} />
                                            )}
                                            {comment.type === 'voice' && comment.media_data && (
                                                <audio controls src={comment.media_data} className={`h-8 w-full min-w-[200px] ${comment.user_id === currentUser?.id ? 'invert' : ''}`} />
                                            )}
                                            <span className={`text-[9px] mt-1.5 block opacity-60 font-medium ${comment.user_id === currentUser?.id ? 'text-white text-left' : 'text-gray-400 text-left'}`}>
                                                {comment.created_at ? new Date(comment.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && !isLoading && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    لا توجد تعليقات بعد. كن أول من يعلق!
                                </div>
                            )}
                            {isLoading && comments.length === 0 && (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="w-8 h-8 bg-gray-100 rounded-full" />
                                            <div className="h-16 bg-gray-50 rounded-2xl flex-1" />
                                        </div>
                                    ))}
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
                            className="flex-1 bg-transparent outline-none text-sm resize-none py-2 max-h-24 text-right"
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
