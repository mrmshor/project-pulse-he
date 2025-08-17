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
  triggerDate: string; // ✅ FIXED: ISO string instead of Date
  isActive: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    endDate?: string; // ✅ FIXED: ISO string instead of Date
  };
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'תכנון' | 'פעיל' | 'הושלם' | 'מושהה' | 'בוטל'; // ✅ FIXED: Added missing statuses
  priority: 'נמוכה' | 'בינונית' | 'גבוהה';
  startDate: string; // ✅ FIXED: ISO string instead of Date
  dueDate?: string; // ✅ FIXED: ISO string instead of Date
  createdAt: string; // ✅ ADDED: Missing field used by components
  updatedAt: string; // ✅ ADDED: Missing field used by components
  budget?: number; // ✅ ADDED: Missing field used by components
  paidAmount?: number; // ✅ ADDED: Missing field used by components
  paymentStatus?: PaymentStatus; // ✅ ADDED: Missing field used by components
  tasks?: Task[]; // ✅ FIXED: Made optional since tasks are stored separately
  contacts?: Contact[]; // ✅ FIXED: Made optional since contacts are stored separately
  tags?: Tag[]; // ✅ FIXED: Made optional
  reminders?: Reminder[]; // ✅ FIXED: Made optional
  folderPath?: string; // נתיב לתיקיה המקושרת
  notes?: string; // ✅ ADDED: Missing field used by components
  client?: { // ✅ FIXED: Made optional
    id?: string; // ✅ ADDED: Contact ID reference
    name: string;
    whatsappNumbers?: {
      id: string;
      number: string;
      label: string; // כמו "אישי", "עסקי", "משרד"
      isPrimary: boolean;
    }[];
    whatsapp?: string; // מספר וואטסאפ פשוט
    email?: string;
    phone?: string;
    company?: string;
    notes?: string;
  };
  // פרטי תשלום - DEPRECATED: Use budget, paidAmount, paymentStatus instead
  payment?: {
    amount?: number;
    currency: 'ILS' | 'USD' | 'EUR';
    isPaid: boolean;
    paidDate?: string; // ✅ FIXED: ISO string instead of Date
    notes?: string;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string; // ✅ ADDED: Missing field used by components
  status: 'ממתין' | 'בעבודה' | 'הושלם'; // ✅ FIXED: Updated to match component usage
  priority: 'נמוכה' | 'בינונית' | 'גבוהה';
  completed: boolean; // ✅ ADDED: Missing field used by components
  dueDate?: string; // ✅ FIXED: ISO string instead of Date
  createdAt: string; // ✅ ADDED: Missing field used by components
  updatedAt: string; // ✅ ADDED: Missing field used by components
  timeEntries?: TimeEntry[];
  tags?: Tag[]; // ✅ FIXED: Made optional
  order?: number; // ✅ FIXED: Made optional
  estimatedTime?: number; // in minutes
}

export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: string; // ✅ FIXED: ISO string instead of Date
  endTime?: string; // ✅ FIXED: ISO string instead of Date
  duration: number; // in minutes
  description?: string;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string; // פורמט ישראלי 05X-XXXXXXX
  whatsapp?: string; // מספר וואטסאפ
  company?: string; // ✅ ADDED: Missing field used by components
  address?: string; // ✅ ADDED: Missing field used by components
  notes?: string; // ✅ ADDED: Missing field used by components
  type?: 'לקוח' | 'ספק' | 'שותף' | 'עמית' | 'אחר'; // ✅ ADDED: Missing field used by components
  createdAt: string; // ✅ ADDED: Missing field used by components
  updatedAt: string; // ✅ ADDED: Missing field used by components
  projectIds?: string[]; // ✅ FIXED: Made optional
  tags?: Tag[]; // ✅ FIXED: Made optional
}

// ✅ ADDED: Missing PaymentStatus type used by components
export type PaymentStatus = 'ממתין לתשלום' | 'שולם חלקית' | 'שולם במלואו' | 'לא רלוונטי';

// Type exports
export type ProjectStatus = Project['status'];
export type TaskStatus = Task['status']; // ✅ FIXED: Now uses correct Task status values
export type Priority = Project['priority'];

// משימות אישיות - נפרדות מהפרויקטים
export interface PersonalTask {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;
  createdAt: string; // ✅ FIXED: ISO string instead of Date for consistency
  completedAt?: string; // ✅ FIXED: ISO string instead of Date for consistency
}

// ✅ ADDED: Export useful utility types
export type ContactType = Contact['type'];
export type ReminderType = Reminder['type'];
export type TagCategory = Tag['category'];
