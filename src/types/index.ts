export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'תכנון' | 'פעיל' | 'הושלם' | 'בהמתנה';
  priority: 'נמוכה' | 'בינונית' | 'גבוהה';
  startDate: Date;
  dueDate?: Date;
  tasks: Task[];
  contacts: Contact[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: 'לביצוע' | 'בתהליך' | 'הושלמה';
  priority: 'נמוכה' | 'בינונית' | 'גבוהה';
  dueDate?: Date;
  timeEntries?: TimeEntry[];
}

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  description?: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string; // פורמט ישראלי 05X-XXXXXXX
  projectIds: string[];
}

export type ProjectStatus = Project['status'];
export type TaskStatus = Task['status'];
export type Priority = Project['priority'];