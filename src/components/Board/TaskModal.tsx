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
    const [currentBg, setCurrentBg] = useState(task.background_color || '#ffffff');

    const isAdmin = !!currentUser?.id && !!team?.admin_id && currentUser.id === team.admin_id;

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetchComments();
            setTitle(task.title);
            setStatus(task.status);
            setCurrentBg(task.background_color || '#ffffff');
        }
    }, [isOpen, task.id, task.title, task.status, task.background_color]);

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
        <div className="fixed inset-0 z-50 flex items-center justify-end sm:justify-center pointer-events-none transition-colors duration-300">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            <motion.div
                initial={{ x: '100%', opacity: 0.5 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="pointer-events-auto bg-card w-full sm:w-[500px] h-full shadow-2xl flex flex-col sm:rounded-l-3xl border-l border-border"
            >
                <div className="p-6 border-b border-border flex items-start justify-between bg-primary/5">
                    <div className="flex-1">
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={saveTitle}
                            className={`text-2xl font-black bg-transparent outline-none w-full text-foreground`}
                            placeholder="عنوان المهمة"
                        />
                        <div className="flex flex-wrap gap-2 mt-4">
                            {(['Plan', 'Execution', 'Review', 'Completed'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => handleStatusChange(s)}
                                    className={`text-sm px-3 py-1.5 rounded-full border transition-all font-bold ${status === s
                                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                                        : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                                        }`}
                                >
                                    {s === 'Plan' ? 'الخطة' : s === 'Execution' ? 'جاري العمل' : s === 'Review' ? 'مراجعة' : 'مكتمل'}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                            <span className="text-xs font-bold text-muted-foreground ml-2">لون الخلفية:</span>
                            {[
                                'transparent',
                                'rgba(59, 130, 246, 0.1)',
                                'rgba(236, 72, 153, 0.1)',
                                'rgba(34, 197, 94, 0.1)',
                                'rgba(234, 179, 8, 0.1)',
                                'rgba(168, 85, 247, 0.1)',
                                'rgba(239, 68, 68, 0.1)',
                            ].map((color) => (
                                <button
                                    key={color}
                                    onClick={async () => {
                                        setCurrentBg(color);
                                        updateTask(task.id, { background_color: color });
                                        try {
                                            await fetch(`/api/tasks/${task.id}`, {
                                                method: 'PUT',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ background_color: color })
                                            });
                                        } catch (e) {
                                            toast.error('فشل حفظ اللون');
                                            setCurrentBg(task.background_color || 'transparent');
                                        }
                                    }}
                                    className={`w-6 h-6 rounded-full border transition-transform hover:scale-110 ${currentBg === color ? 'ring-2 ring-primary ring-offset-2' : 'border-border'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <button
                                onClick={handleDeleteTask}
                                disabled={isDeleting}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all"
                                title="حذف المهمة"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {task.image_data && (
                        <div className="rounded-xl overflow-hidden border border-border shadow-sm">
                            <img src={task.image_data} alt="Cover" className="w-full h-48 object-cover" />
                        </div>
                    )}

                    <div>
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 text-right">التعليقات والنشاط</h3>
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className={`flex gap-3 ${comment.user_id === currentUser?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-full ${getAvatarColor(comment.username || '؟')} flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm ring-2 ring-white`}>
                                        {(comment.username || '؟').charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`flex flex-col max-w-[80%] ${comment.user_id === currentUser?.id ? 'items-end' : 'items-start'}`}>
                                        <span className="text-[10px] font-bold text-muted-foreground mb-1 px-1">{comment.username || 'عضو سابق'}</span>
                                        <div className={`p-3 rounded-2xl border shadow-sm ${comment.user_id === currentUser?.id
                                            ? 'bg-primary text-primary-foreground border-primary/20 rounded-tr-none text-right'
                                            : 'bg-muted/30 text-foreground border-border rounded-tl-none text-right'
                                            }`}>
                                            {comment.type === 'text' && (
                                                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                            )}
                                            {comment.type === 'image' && comment.media_data && (
                                                <img src={comment.media_data} alt="uploaded" className="rounded-lg max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(comment.media_data)} />
                                            )}
                                            {comment.type === 'voice' && comment.media_data && (
                                                <audio controls src={comment.media_data} className={`h-8 w-full min-w-[200px] ${comment.user_id === currentUser?.id ? 'invert opacity-70' : ''}`} />
                                            )}
                                            <span className={`text-[9px] mt-1.5 block opacity-60 font-medium ${comment.user_id === currentUser?.id ? 'text-primary-foreground text-left' : 'text-muted-foreground text-left'}`}>
                                                {comment.created_at ? new Date(comment.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'الآن'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && !isLoading && (
                                <div className="text-center py-8 text-muted-foreground text-sm">
                                    لا توجد تعليقات بعد. كن أول من يعلق!
                                </div>
                            )}
                            {isLoading && comments.length === 0 && (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex gap-3 animate-pulse">
                                            <div className="w-8 h-8 bg-muted rounded-full" />
                                            <div className="h-16 bg-muted/40 rounded-2xl flex-1" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-card border-t border-border">
                    <div className="flex items-end gap-2 bg-muted/30 p-2 rounded-2xl border border-border focus-within:ring-2 focus-within:ring-primary/10 transition-all">
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
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-colors"
                        >
                            <ImageIcon size={20} />
                        </button>

                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="اكتب تعليقاً..."
                            className="flex-1 bg-transparent outline-none text-sm resize-none py-2 max-h-24 text-right text-foreground"
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
                            className="p-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
