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
}

export interface User {
    id: string;
    username: string;
    email: string;
    team_id: string;
}

export interface Task {
    id: string;
    title: string;
    status: 'Plan' | 'Execution' | 'Completed' | 'Review';
    image_data?: string;
    team_id: string;
    created_at?: string;
    comment_count?: number;
    user_id?: string;
    user_name?: string;
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

interface AppState {
    team: Team | null;
    currentUser: User | null;
    setTeam: (team: Team | null) => void;
    setCurrentUser: (user: User | null) => void;

    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
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
            logout: () => set({ team: null, currentUser: null, tasks: [] }),
        }),
        {
            name: 'team-assistant-storage',
        }
    )
);
