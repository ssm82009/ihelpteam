import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Team {
    id: string;
    name: string;
    description: string;
    secret_code: string;
    admin_id?: string;
    title_plan?: string;
    title_execution?: string;
    title_completed?: string;
    title_review?: string;
    title_notes?: string;
    color_plan?: string;
    color_execution?: string;
    color_review?: string;
    color_completed?: string;
    color_notes?: string;
    is_locked?: number | boolean;
}

export interface User {
    id: string;
    username: string;
    email: string;
    team_id: string;
    plan_type?: 'free' | 'pro';
    subscription_end?: string | null;
    profile_image?: string;
}

export interface Task {
    id: string;
    title: string;
    status: 'Plan' | 'Execution' | 'Completed' | 'Review' | 'Notes';
    image_data?: string;
    team_id: string;
    created_at?: string;
    comment_count?: number;
    user_id?: string;
    user_name?: string;
    user_image?: string;
    assigned_id?: string;
    assigned_name?: string;
    assigned_image?: string;
    background_color?: string;
}

export interface Comment {
    id: string;
    task_id: string;
    content: string;
    type: 'text' | 'image' | 'voice';
    media_data?: string;
    created_at?: string;
}

export type ThemeType = 'light-pro' | 'dark-pro' | 'slate-pro' | 'emerald-pro' | 'pink-pro' | 'purple-pro' | 'forest-pro' | 'contrast-pro';
export type RadiusType = 'sharp' | 'rounded';
export type FontType = 'tajawal' | 'cairo' | 'arial' | 'default';

interface AppState {
    team: Team | null;
    currentUser: User | null;
    setTeam: (team: Team | null) => void;
    setCurrentUser: (user: User | null) => void;

    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
    fontSize: number;
    setFontSize: (size: number) => void;
    isBold: boolean;
    setIsBold: (isBold: boolean) => void;
    theme: ThemeType;
    setTheme: (theme: ThemeType) => void;
    radius: RadiusType;
    setRadius: (radius: RadiusType) => void;
    fontFamily: FontType;
    setFontFamily: (font: FontType) => void;
    logout: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            team: null,
            currentUser: null,
            setTeam: (team) => set({ team }),
            setCurrentUser: (user) => set({ currentUser: user }),

            tasks: [],
            setTasks: (tasks) => set({ tasks }),
            addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
            })),
            fontSize: 16,
            setFontSize: (fontSize) => set({ fontSize }),
            isBold: false,
            setIsBold: (isBold) => set({ isBold }),
            theme: 'light-pro',
            setTheme: (theme) => set({ theme }),
            radius: 'rounded',
            setRadius: (radius) => set({ radius }),
            fontFamily: 'default',
            setFontFamily: (fontFamily) => set({ fontFamily }),
            logout: () => set({ team: null, currentUser: null, tasks: [], isBold: false }),
        }),
        {
            name: 'team-assistant-storage',
        }
    )
);
