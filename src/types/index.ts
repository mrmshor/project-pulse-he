export interface Tag {
  id: string;
  name: string;
  color: string;
  category?: 'status' | 'priority' | 'type' | 'custom';
  icon?: string;
}

export interface Reminder {
  id: string;
  type: 'deadline' | 'followup' | 'meeting' | 'custom';
  message: string;
  triggerDate: Date;
  isActive: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: Date;
  };
}

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
  tags: Tag[];
  reminders: Reminder[];
  folderPath?: string; // נתיב לתיקיה המקושרת
  client: {
    name: string;
    whatsappNumbers?: {
      id: string;
      number: string;
      label: string; // כמו "אישי", "עסקי", "משרד"
      isPrimary: boolean;
    }[];
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
  };
  // פרטי תשלום
  payment: {
    amount?: number;
    currency: 'ILS' | 'USD' | 'EUR';
    isPaid: boolean;
    paidDate?: Date;
    notes?: string;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: 'לביצוע' | 'בתהליך' | 'הושלמה';
  priority: 'נמוכה' | 'בינונית' | 'גבוהה';
  dueDate?: Date;
  timeEntries?: TimeEntry[];
  tags: Tag[];
  order: number;
  estimatedTime?: number; // in minutes
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
  tags: Tag[];
}

export type ProjectStatus = Project['status'];
export type TaskStatus = Task['status'];
export type Priority = Project['priority'];

// משימות אישיות - נפרדות מהפרויקטים
export interface PersonalTask {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: Date;
  completedAt?: Date;
}