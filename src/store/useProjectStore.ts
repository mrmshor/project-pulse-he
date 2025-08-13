import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Task, Contact, TimeEntry, ProjectStatus, Priority } from '@/types';
import { isTauriEnvironment, saveDataNative, loadDataNative } from '@/lib/tauri';

interface ProjectStore {
  // State
  projects: Project[];
  tasks: Task[];
  contacts: Contact[];
  timeEntries: TimeEntry[];

  // Project actions
  addProject: (projectData: Omit<Project, 'id'>) => void;
  updateProject: (id: string, projectData: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;

  // Task actions
  addTask: (taskData: Omit<Task, 'id'>) => void;
  updateTask: (id: string, taskData: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksByProject: (projectId: string) => Task[];

  // Contact actions
  addContact: (contactData: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, contactData: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  getContactsByProject: (projectId: string) => Contact[];

  // Time Entry actions
  addTimeEntry: (timeEntryData: Omit<TimeEntry, 'id'>) => void;
  updateTimeEntry: (id: string, timeEntryData: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  getTimeEntriesByTask: (taskId: string) => TimeEntry[];

  // Export actions
  exportToJSON: () => string;
  exportToCSV: (type: 'projects' | 'tasks' | 'contacts') => string;

  // Native save/load functions
  saveToNative: () => Promise<boolean>;
  loadFromNative: () => Promise<void>;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      // Initial state
      projects: [],
      tasks: [],
      contacts: [],
      timeEntries: [],

      // Project actions
      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: generateId(),
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

      // Task actions
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
          timeEntries: state.timeEntries.filter((entry) => entry.taskId !== id),
        }));
      },

      getTasksByProject: (projectId) => {
        return get().tasks.filter((task) => task.projectId === projectId);
      },

      // Contact actions
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

      // Export functions
      exportToJSON: () => {
        const { projects, tasks, contacts, timeEntries } = get();
        return JSON.stringify({ projects, tasks, contacts, timeEntries }, null, 2);
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

      // Time Entries
      addTimeEntry: (timeEntryData) => {
        const newTimeEntry: TimeEntry = {
          ...timeEntryData,
          id: generateId(),
        };
        set((state) => ({
          timeEntries: [...state.timeEntries, newTimeEntry],
        }));
      },

      updateTimeEntry: (id, timeEntryData) => {
        set((state) => ({
          timeEntries: state.timeEntries.map((entry) =>
            entry.id === id ? { ...entry, ...timeEntryData } : entry
          ),
        }));
      },

      deleteTimeEntry: (id) => {
        set((state) => ({
          timeEntries: state.timeEntries.filter((entry) => entry.id !== id),
        }));
      },

      getTimeEntriesByTask: (taskId) => {
        return get().timeEntries.filter((entry) => entry.taskId === taskId);
      },

      // Native save/load functions
      saveToNative: async () => {
        try {
          if (isTauriEnvironment()) {
            const { projects, tasks, contacts, timeEntries } = get();
            return await saveDataNative({ projects, tasks, contacts, timeEntries });
          }
          return false;
        } catch (error) {
          console.error('Error saving to native:', error);
          return false;
        }
      },

      loadFromNative: async () => {
        try {
          if (isTauriEnvironment()) {
            const data = await loadDataNative();
            if (data) {
              set({
                projects: data.projects || [],
                tasks: data.tasks || [],
                contacts: data.contacts || [],
                timeEntries: data.timeEntries || []
              });
            }
          }
        } catch (error) {
          console.error('Error loading from native:', error);
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
