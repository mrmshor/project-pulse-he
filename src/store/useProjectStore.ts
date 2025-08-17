import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Task, Contact, TimeEntry } from '@/types';
import { isTauriEnvironment, saveDataNative, loadDataNative } from '@/lib/tauri';

interface ProjectStore {
  // State
  projects: Project[];
  tasks: Task[];
  contacts: Contact[];
  timeEntries: TimeEntry[];

  // Project actions - FIXED: Updated signatures to match component usage
  addProject: (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;

  // Task actions - FIXED: Updated signatures
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  getTasksByProject: (projectId: string) => Task[];

  // Contact actions - FIXED: Updated signatures
  addContact: (contactData: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Contact>;
  updateContact: (contact: Contact) => void;
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

      // Project actions - FIXED
      addProject: async (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
        
        return newProject;
      },

      updateProject: (project) => {
        const updatedProject = {
          ...project,
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === project.id ? updatedProject : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          tasks: state.tasks.filter((task) => task.projectId !== id),
          contacts: state.contacts.filter((contact) => 
            !contact.projectIds || !contact.projectIds.includes(id)
          ),
        }));
      },

      getProjectById: (id) => {
        return get().projects.find((project) => project.id === id);
      },

      // Task actions - FIXED
      addTask: (taskData) => {
        const newTask: Task = {
          ...taskData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTask: (task) => {
        const updatedTask = {
          ...task,
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === task.id ? updatedTask : t
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

      // Contact actions - FIXED
      addContact: async (contactData) => {
        const newContact: Contact = {
          ...contactData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          contacts: [...state.contacts, newContact],
        }));
        
        return newContact;
      },

      updateContact: (contact) => {
        const updatedContact = {
          ...contact,
          updatedAt: new Date().toISOString()
        };
        
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === contact.id ? updatedContact : c
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
          contact.projectIds && contact.projectIds.includes(projectId)
        );
      },

      // Time Entry actions
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
          const headers = ['כותרת', 'פרויקט', 'סטטוס', 'עדיפות', 'הושלם'];
          const rows = tasks.map((t) => {
            const project = projects.find((p) => p.id === t.projectId);
            return [
              t.title,
              project?.name || '',
              t.status || 'ממתין',
              t.priority,
              t.completed ? 'כן' : 'לא',
            ];
          });
          return [headers, ...rows].map((row) => row.join(',')).join('\n');
        }

        if (type === 'contacts') {
          const headers = ['שם', 'אימייל', 'טלפון', 'חברה', 'סוג'];
          const rows = contacts.map((c) => [
            c.name,
            c.email || '',
            c.phone || '',
            c.company || '',
            c.type || 'לקוח',
          ]);
          return [headers, ...rows].map((row) => row.join(',')).join('\n');
        }

        return '';
      },

      // Native save/load functions
      saveToNative: async () => {
        if (!isTauriEnvironment()) {
          console.warn('Not in Tauri environment, cannot save to native storage');
          return false;
        }

        try {
          const { projects, tasks, contacts, timeEntries } = get();
          const data = { projects, tasks, contacts, timeEntries };
          await saveDataNative(JSON.stringify(data));
          console.log('✅ Data saved to native storage successfully');
          return true;
        } catch (error) {
          console.error('❌ Error saving to native storage:', error);
          return false;
        }
      },

      loadFromNative: async () => {
        if (!isTauriEnvironment()) {
          console.warn('Not in Tauri environment, cannot load from native storage');
          return;
        }

        try {
          const data = await loadDataNative();
          if (data) {
            const parsed = JSON.parse(data);
            set({
              projects: parsed.projects || [],
              tasks: parsed.tasks || [],
              contacts: parsed.contacts || [],
              timeEntries: parsed.timeEntries || [],
            });
            console.log('✅ Data loaded from native storage successfully');
          }
        } catch (error) {
          console.error('❌ Error loading from native storage:', error);
        }
      },
    }),
    {
      name: 'project-store',
      version: 1,
    }
  )
);

// ✅ NEW: Hook לחישוב סטטיסטיקות פרויקט (הפונקציה החסרה!)
export const useProjectStats = () => {
  const projects = useProjectStore((state) => state.projects);
  const tasks = useProjectStore((state) => state.tasks);
  
  return {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'פעיל').length,
    completedProjects: projects.filter(p => p.status === 'הושלם').length,
    plannedProjects: projects.filter(p => p.status === 'תכנון').length,
    onHoldProjects: projects.filter(p => p.status === 'מושהה').length,
    
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'הושלם').length,
    pendingTasks: tasks.filter(t => t.status !== 'הושלם').length,
    inProgressTasks: tasks.filter(t => t.status === 'בעבודה').length,
    urgentTasks: tasks.filter(t => t.status !== 'הושלם' && t.priority === 'גבוהה').length,
    
    completionRate: tasks.length > 0 ? (tasks.filter(t => t.status === 'הושלם').length / tasks.length) * 100 : 0,
    projectCompletionRate: projects.length > 0 ? (projects.filter(p => p.status === 'הושלם').length / projects.length) * 100 : 0,
    
    // סטטיסטיקות לפי עדיפות
    highPriorityTasks: tasks.filter(t => t.priority === 'גבוהה').length,
    mediumPriorityTasks: tasks.filter(t => t.priority === 'בינונית').length,
    lowPriorityTasks: tasks.filter(t => t.priority === 'נמוכה').length,
    
    highPriorityProjects: projects.filter(p => p.priority === 'גבוהה').length,
    mediumPriorityProjects: projects.filter(p => p.priority === 'בינונית').length,
    lowPriorityProjects: projects.filter(p => p.priority === 'נמוכה').length,
  };
};
