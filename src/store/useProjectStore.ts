import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Task, Contact } from '@/types';
import { isTauriEnvironment, saveDataNative, loadDataNative } from '@/lib/tauri';

interface ProjectStore {
  projects: Project[];
  tasks: Task[];
  contacts: Contact[];
  
  // Projects
  addProject: (project: Omit<Project, 'id' | 'tasks' | 'contacts'>) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
  
  // Tasks
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByProject: (projectId: string) => Task[];
  
  // Contacts
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, contact: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContactsByProject: (projectId: string) => Contact[];
  
  // Export with native support
  exportToJSON: () => string;
  exportToCSV: (type: 'projects' | 'tasks' | 'contacts') => string;
  
  // Native save/load
  saveToNative: () => Promise<boolean>;
  loadFromNative: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Custom storage for Tauri support
const tauriStorage = {
  getItem: async (name: string) => {
    if (isTauriEnvironment()) {
      const data = await loadDataNative();
      return data ? JSON.stringify(data) : null;
    }
    return localStorage.getItem(name);
  },
  setItem: async (name: string, value: string) => {
    if (isTauriEnvironment()) {
      await saveDataNative(JSON.parse(value));
    } else {
      localStorage.setItem(name, value);
    }
  },
  removeItem: async (name: string) => {
    if (isTauriEnvironment()) {
      // Implement if needed
    } else {
      localStorage.removeItem(name);
    }
  }
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      tasks: [],
      contacts: [],
      
      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: generateId(),
          tasks: [],
          contacts: [],
        };
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
      },
      
      updateProject: (id, projectData) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...projectData } : project
          ),
        }));
      },
      
      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          tasks: state.tasks.filter((task) => task.projectId !== id),
          contacts: state.contacts.map((contact) => ({
            ...contact,
            projectIds: contact.projectIds.filter((pId) => pId !== id),
          })),
        }));
      },
      
      getProjectById: (id) => {
        return get().projects.find((project) => project.id === id);
      },
      
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },
      
      updateTask: (id, taskData) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...taskData } : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },
      
      getTasksByProject: (projectId) => {
        return get().tasks.filter((task) => task.projectId === projectId);
      },
      
      addContact: (contactData) => {
        const newContact: Contact = {
          ...contactData,
          id: generateId(),
        };
        set((state) => ({
          contacts: [...state.contacts, newContact],
        }));
      },
      
      updateContact: (id, contactData) => {
        set((state) => ({
          contacts: state.contacts.map((contact) =>
            contact.id === id ? { ...contact, ...contactData } : contact
          ),
        }));
      },
      
      deleteContact: (id) => {
        set((state) => ({
          contacts: state.contacts.filter((contact) => contact.id !== id),
        }));
      },
      
      getContactsByProject: (projectId) => {
        return get().contacts.filter((contact) =>
          contact.projectIds.includes(projectId)
        );
      },
      
      exportToJSON: () => {
        const { projects, tasks, contacts } = get();
        return JSON.stringify({ projects, tasks, contacts }, null, 2);
      },
      
      exportToCSV: (type) => {
        const { projects, tasks, contacts } = get();
        
        if (type === 'projects') {
          const headers = ['שם', 'תיאור', 'סטטוס', 'עדיפות', 'תאריך התחלה', 'תאריך יעד'];
          const rows = projects.map((p) => [
            p.name,
            p.description,
            p.status,
            p.priority,
            new Date(p.startDate).toLocaleDateString('he-IL'),
            p.dueDate ? new Date(p.dueDate).toLocaleDateString('he-IL') : '',
          ]);
          return [headers, ...rows].map((row) => row.join(',')).join('\n');
        }
        
        if (type === 'tasks') {
          const headers = ['כותרת', 'פרויקט', 'סטטוס', 'עדיפות', 'תאריך יעד'];
          const rows = tasks.map((t) => {
            const project = projects.find((p) => p.id === t.projectId);
            return [
              t.title,
              project?.name || '',
              t.status,
              t.priority,
              t.dueDate ? new Date(t.dueDate).toLocaleDateString('he-IL') : '',
            ];
          });
          return [headers, ...rows].map((row) => row.join(',')).join('\n');
        }
        
        if (type === 'contacts') {
          const headers = ['שם', 'אימייל', 'טלפון', 'פרויקטים'];
          const rows = contacts.map((c) => [
            c.name,
            c.email || '',
            c.phone || '',
            c.projectIds.map((id) => projects.find((p) => p.id === id)?.name).filter(Boolean).join('; '),
          ]);
          return [headers, ...rows].map((row) => row.join(',')).join('\n');
        }
        
        return '';
      },
      
      // Native save/load functions
      saveToNative: async () => {
        if (isTauriEnvironment()) {
          const { projects, tasks, contacts } = get();
          return await saveDataNative({ projects, tasks, contacts });
        }
        return false;
      },
      
      loadFromNative: async () => {
        if (isTauriEnvironment()) {
          const data = await loadDataNative();
          if (data) {
            set({
              projects: data.projects || [],
              tasks: data.tasks || [],
              contacts: data.contacts || []
            });
          }
        }
      },
    }),
    {
      name: 'project-store',
    }
  )
);

// Helper selectors to prevent infinite loops
export const useProjectStats = () => {
  const projects = useProjectStore((state) => state.projects);
  const tasks = useProjectStore((state) => state.tasks);
  
  return {
    totalProjects: projects.length,
    activeTasks: tasks.filter((task) => task.status !== 'הושלמה').length,
    completedThisWeek: tasks.filter((task) => task.status === 'הושלמה').length,
    activeProjects: projects.filter((project) => project.status === 'פעיל').length,
  };
};