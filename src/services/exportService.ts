import * as XLSX from 'xlsx';
import { Project, Task, Contact, TimeEntry } from '@/types';
import { isTauriEnvironment, exportFileNative } from '@/lib/tauri';

export class ExportService {
  static async exportToExcel(data: {
    projects: Project[];
    tasks: Task[];
    contacts: Contact[];
    timeEntries: TimeEntry[];
  }) {
    const workbook = XLSX.utils.book_new();

    // גיליון פרויקטים
    const projectsData = data.projects.map(p => ({
      'שם הפרויקט': p.name,
      'תיאור': p.description,
      'סטטוס': p.status,
      'עדיפות': p.priority,
      'תאריך התחלה': new Date(p.startDate).toLocaleDateString('he-IL'),
      'תאריך יעד': p.dueDate ? new Date(p.dueDate).toLocaleDateString('he-IL') : '',
      'מספר משימות': data.tasks.filter(t => t.projectId === p.id).length,
      'משימות הושלמו': data.tasks.filter(t => t.projectId === p.id && t.status === 'הושלם').length,
      'אנשי קשר': data.contacts.filter(c => (c.projectIds?.includes(p.id) ?? false)).length
    }));

    const projectsSheet = XLSX.utils.json_to_sheet(projectsData);
    XLSX.utils.book_append_sheet(workbook, projectsSheet, 'פרויקטים');

    // גיליון משימות
    const tasksData = data.tasks.map(t => {
      const project = data.projects.find(p => p.id === t.projectId);
      const taskTimeEntries = data.timeEntries.filter(te => te.taskId === t.id);
      const totalTime = taskTimeEntries.reduce((sum, entry) => sum + entry.duration, 0);
      
      return {
        'כותרת': t.title,
        'פרויקט': project?.name || '',
        'סטטוס': t.status,
        'עדיפות': t.priority,
        'תאריך יעד': t.dueDate ? new Date(t.dueDate).toLocaleDateString('he-IL') : '',
        'זמן מושקע (דקות)': totalTime,
        'זמן מושקע (שעות)': Math.round(totalTime / 60 * 100) / 100,
        'מספר רשומות זמן': taskTimeEntries.length
      };
    });

    const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
    XLSX.utils.book_append_sheet(workbook, tasksSheet, 'משימות');

    // גיליון אנשי קשר
    const contactsData = data.contacts.map(c => ({
      'שם': c.name,
      'אימייל': c.email || '',
      'טלפון': c.phone || '',
      'פרויקטים': (c.projectIds ?? [])
        .map(id => data.projects.find(p => p.id === id)?.name)
        .filter(Boolean)
        .join('; '),
      'מספר פרויקטים': (c.projectIds?.length ?? 0)
    }));

    const contactsSheet = XLSX.utils.json_to_sheet(contactsData);
    XLSX.utils.book_append_sheet(workbook, contactsSheet, 'אנשי קשר');

    // גיליון מעקב זמן
    const timeData = data.timeEntries.map(te => {
      const task = data.tasks.find(t => t.id === te.taskId);
      const project = task ? data.projects.find(p => p.id === task.projectId) : null;
      
      return {
        'משימה': task?.title || '',
        'פרויקט': project?.name || '',
        'תאריך התחלה': new Date(te.startTime).toLocaleDateString('he-IL'),
        'שעת התחלה': new Date(te.startTime).toLocaleTimeString('he-IL'),
        'תאריך סיום': te.endTime ? new Date(te.endTime).toLocaleDateString('he-IL') : '',
        'שעת סיום': te.endTime ? new Date(te.endTime).toLocaleTimeString('he-IL') : '',
        'משך (דקות)': te.duration,
        'משך (שעות)': Math.round(te.duration / 60 * 100) / 100,
        'תיאור': te.description || ''
      };
    });

    const timeSheet = XLSX.utils.json_to_sheet(timeData);
    XLSX.utils.book_append_sheet(workbook, timeSheet, 'מעקב זמן');

    // יצירת summary
    const summaryData = [
      { 'נתון': 'סה"כ פרויקטים', 'ערך': data.projects.length },
      { 'נתון': 'פרויקטים פעילים', 'ערך': data.projects.filter(p => p.status === 'פעיל').length },
      { 'נתון': 'פרויקטים הושלמו', 'ערך': data.projects.filter(p => p.status === 'הושלם').length },
      { 'נתון': 'סה"כ משימות', 'ערך': data.tasks.length },
      { 'נתון': 'משימות הושלמו', 'ערך': data.tasks.filter(t => t.status === 'הושלם').length },
      { 'נתון': 'סה"כ אנשי קשר', 'ערך': data.contacts.length },
      { 'נתון': 'סה"כ זמן מושקע (שעות)', 'ערך': Math.round(data.timeEntries.reduce((sum, te) => sum + te.duration, 0) / 60 * 100) / 100 },
      { 'נתון': 'תאריך יצירת הדוח', 'ערך': new Date().toLocaleDateString('he-IL') }
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'סיכום');

    // שמירה
    const filename = `project_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    if (isTauriEnvironment()) {
      // שמירה נייטיבית
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      const uint8Array = new Uint8Array(buffer);
      const content = Array.from(uint8Array).map(byte => String.fromCharCode(byte)).join('');
      
      return await exportFileNative(content, filename, 'xlsx' as any);
    } else {
      // הורדה ברקדן
      XLSX.writeFile(workbook, filename);
      return true;
    }
  }

  static async exportToDetailedCSV(data: {
    projects: Project[];
    tasks: Task[];
    contacts: Contact[];
    timeEntries: TimeEntry[];
  }, type: 'projects' | 'tasks' | 'contacts' | 'time') {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'projects':
        const projectHeaders = ['שם', 'תיאור', 'סטטוס', 'עדיפות', 'תאריך התחלה', 'תאריך יעד', 'מספר משימות', 'הושלמו'];
        const projectRows = data.projects.map(p => [
          p.name,
          p.description,
          p.status,
          p.priority,
          new Date(p.startDate).toLocaleDateString('he-IL'),
          p.dueDate ? new Date(p.dueDate).toLocaleDateString('he-IL') : '',
          data.tasks.filter(t => t.projectId === p.id).length,
          data.tasks.filter(t => t.projectId === p.id && t.status === 'הושלם').length
        ]);
        csvContent = [projectHeaders, ...projectRows].map(row => row.join(',')).join('\n');
        filename = 'projects_detailed.csv';
        break;

      case 'tasks':
        const taskHeaders = ['כותרת', 'פרויקט', 'סטטוס', 'עדיפות', 'תאריך יעד', 'זמן מושקע (שעות)'];
        const taskRows = data.tasks.map(t => {
          const project = data.projects.find(p => p.id === t.projectId);
          const totalTime = data.timeEntries.filter(te => te.taskId === t.id).reduce((sum, entry) => sum + entry.duration, 0);
          return [
            t.title,
            project?.name || '',
            t.status,
            t.priority,
            t.dueDate ? new Date(t.dueDate).toLocaleDateString('he-IL') : '',
            Math.round(totalTime / 60 * 100) / 100
          ];
        });
        csvContent = [taskHeaders, ...taskRows].map(row => row.join(',')).join('\n');
        filename = 'tasks_detailed.csv';
        break;

      case 'contacts':
        const contactHeaders = ['שם', 'אימייל', 'טלפון', 'פרויקטים'];
        const contactRows = data.contacts.map(c => [
          c.name,
          c.email || '',
          c.phone || '',
          (c.projectIds ?? []).map(id => data.projects.find(p => p.id === id)?.name).filter(Boolean).join('; ')
        ]);
        csvContent = [contactHeaders, ...contactRows].map(row => row.join(',')).join('\n');
        filename = 'contacts_detailed.csv';
        break;

      case 'time':
        const timeHeaders = ['משימה', 'פרויקט', 'תאריך', 'שעת התחלה', 'שעת סיום', 'משך (שעות)', 'תיאור'];
        const timeRows = data.timeEntries.map(te => {
          const task = data.tasks.find(t => t.id === te.taskId);
          const project = task ? data.projects.find(p => p.id === task.projectId) : null;
          return [
            task?.title || '',
            project?.name || '',
            new Date(te.startTime).toLocaleDateString('he-IL'),
            new Date(te.startTime).toLocaleTimeString('he-IL'),
            te.endTime ? new Date(te.endTime).toLocaleTimeString('he-IL') : '',
            Math.round(te.duration / 60 * 100) / 100,
            te.description || ''
          ];
        });
        csvContent = [timeHeaders, ...timeRows].map(row => row.join(',')).join('\n');
        filename = 'time_tracking.csv';
        break;
    }

    if (isTauriEnvironment()) {
      return await exportFileNative(csvContent, filename, 'csv');
    } else {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      return true;
    }
  }
}