import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Team {
    id: string;
    name: string;
    description: string;
    secret_code: string;
}

export interface Task {
    id: string;
    title: string;
    status: 'Plan' | 'Execution' | 'Completed' | 'Review';
    image_data?: string;
    team_id: string;
    created_at?: string;
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
    setTeam: (team: Team | null) => void;

    tasks: Task[];
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Task) => void;
    updateTask: (id: string, updates: Partial<Task>) => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            team: null,
            setTeam: (team) => set({ team }),

            tasks: [],
            setTasks: (tasks) => set({ tasks }),
            addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
            updateTask: (id, updates) => set((state) => ({
                tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
            })),
        }),
        {
            name: 'team-assistant-storage',
        }
    )
);
