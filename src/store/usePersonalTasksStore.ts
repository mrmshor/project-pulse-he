import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PersonalTask, Priority } from '@/types';

interface PersonalTasksStore {
  tasks: PersonalTask[];
  addTask: (title: string, priority?: Priority) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<PersonalTask>) => void;
  clearCompleted: () => void;
}

const generateId = () => Date.now().toString();

export const usePersonalTasksStore = create<PersonalTasksStore>()(
  persist(
    (set) => ({
      tasks: [],
      
      addTask: (title: string, priority: Priority = 'בינונית') => 
        set((state) => ({
          tasks: [
            {
              id: generateId(),
              title: title.trim(),
              completed: false,
              priority,
              createdAt: new Date()
            },
            ...state.tasks
          ]
        })),

      toggleTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completed: !task.completed,
                  completedAt: !task.completed ? new Date() : undefined
                }
              : task
          )
        })),

      deleteTask: (id: string) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id)
        })),

      updateTask: (id: string, updates: Partial<PersonalTask>) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          )
        })),

      clearCompleted: () =>
        set((state) => ({
          tasks: state.tasks.filter((task) => !task.completed)
        }))
    }),
    {
      name: 'personal-tasks-storage'
    }
  )
);