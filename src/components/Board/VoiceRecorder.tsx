'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Trash2, Send } from 'lucide-react';

interface VoiceRecorderProps {
    onRecordingComplete: (audioData: string) => void;
    isSending?: boolean;
}

export default function VoiceRecorder({ onRecordingComplete, isSending }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setAudioURL(url);
                chunksRef.current = [];
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);

        } catch (err) {
            console.error('Error accessing microphone:', err);
            alert('لا يمكن الوصول إلى الميكروفون!');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const cancelRecording = () => {
        setAudioURL(null);
        setRecordingTime(0);
    };

    const confirmRecording = async () => {
        if (audioURL) {
            // Convert blob url to base64
            try {
                const blob = await fetch(audioURL).then(r => r.blob());
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    onRecordingComplete(base64data);
                    setAudioURL(null);
                };
            } catch (e) {
                console.error(e);
            }
        }
    };

    if (audioURL) {
        return (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border border-border">
                <audio src={audioURL} controls className="h-8 w-48 invert-[0.8] opacity-80" />
                <button onClick={cancelRecording} className="p-2 text-destructive hover:bg-destructive/10 rounded-full">
                    <Trash2 size={16} />
                </button>
                <button
                    onClick={confirmRecording}
                    disabled={isSending}
                    className="p-2 text-emerald-600 hover:bg-emerald-500/10 rounded-full disabled:opacity-50"
                >
                    <Send size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            {isRecording ? (
                <div className="flex items-center gap-3 bg-destructive/10 px-3 py-1.5 rounded-full border border-destructive/20">
                    <span className="w-2 h-2 bg-destructive rounded-full animate-pulse"></span>
                    <span className="text-xs font-mono text-destructive font-bold">
                        {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
                    </span>
                    <button onClick={stopRecording} className="p-1.5 bg-card text-destructive rounded-full shadow-sm hover:scale-105 transition border border-destructive/10">
                        <Square size={14} fill="currentColor" />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={startRecording}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                    title="تسجيل صوتي"
                >
                    <Mic size={20} />
                </button>
            )}
        </div>
    );
}
