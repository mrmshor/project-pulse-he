import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';
import { isTauriEnvironment } from '@/lib/tauri';
import { Task, Project } from '@/types';

export class NotificationService {
  private static initialized = false;

  static async init() {
    if (!isTauriEnvironment() || this.initialized) {
      return;
    }

    try {
      let permissionGranted = await isPermissionGranted();
      if (!permissionGranted) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
      }

      if (permissionGranted) {
        this.initialized = true;
        console.log('Notifications initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  static async sendTaskNotification(task: Task, project?: Project) {
    if (!this.initialized || !isTauriEnvironment()) {
      return;
    }

    try {
      await sendNotification({
        title: 'משימה חשובה!',
        body: `${task.title}${project ? ` - ${project.name}` : ''}`,
        icon: 'notification-icon'
      });
    } catch (error) {
      console.error('Failed to send task notification:', error);
    }
  }

  static async sendProjectNotification(project: Project, message: string) {
    if (!this.initialized || !isTauriEnvironment()) {
      return;
    }

    try {
      await sendNotification({
        title: 'עדכון פרויקט',
        body: `${project.name}: ${message}`,
        icon: 'notification-icon'
      });
    } catch (error) {
      console.error('Failed to send project notification:', error);
    }
  }

  static async notifyUrgentTasks(tasks: Task[], projects: Project[]) {
    if (!this.initialized || !isTauriEnvironment()) {
      return;
    }

    const urgentTasks = tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const today = new Date();
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays <= 1 && task.status !== 'הושלמה';
    });

    for (const task of urgentTasks) {
      const project = projects.find(p => p.id === task.projectId);
      const dueDate = new Date(task.dueDate!);
      const isOverdue = dueDate < new Date();
      
      try {
        await sendNotification({
          title: isOverdue ? 'משימה באיחור!' : 'משימה דחופה!',
          body: `${task.title}${project ? ` - ${project.name}` : ''}\nיעד: ${dueDate.toLocaleDateString('he-IL')}`,
          icon: 'notification-icon'
        });
      } catch (error) {
        console.error('Failed to send urgent task notification:', error);
      }
    }

    return urgentTasks.length;
  }

  static async notifyDailyReminder(activeTasksCount: number, dueTodayCount: number) {
    if (!this.initialized || !isTauriEnvironment()) {
      return;
    }

    try {
      await sendNotification({
        title: 'תזכורת יומית',
        body: `יש לך ${activeTasksCount} משימות פעילות, ${dueTodayCount} יעד היום`,
        icon: 'notification-icon'
      });
    } catch (error) {
      console.error('Failed to send daily reminder:', error);
    }
  }

  // התראה כאשר משימה מושלמת
  static async notifyTaskCompleted(task: Task, project?: Project) {
    if (!this.initialized || !isTauriEnvironment()) {
      return;
    }

    try {
      await sendNotification({
        title: 'משימה הושלמה! 🎉',
        body: `${task.title}${project ? ` - ${project.name}` : ''}`,
        icon: 'notification-icon'
      });
    } catch (error) {
      console.error('Failed to send completion notification:', error);
    }
  }
}

// Auto-initialize when module loads
if (typeof window !== 'undefined') {
  NotificationService.init();
}