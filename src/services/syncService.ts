import { isTauriEnvironment, saveDataNative, loadDataNative } from '@/lib/tauri';

export interface SyncableData {
  projects: any[];
  tasks: any[];
  contacts: any[];
  lastSync: string;
  version: string;
}

export class SyncService {
  private static instance: SyncService;
  private isOnline = navigator.onLine;
  private lastSyncTime: Date | null = null;

  private constructor() {
    // מאזין לשינויי חיבור
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.handleConnectionRestored();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * שמירת נתונים מקומית (Tauri) או localStorage (Web)
   */
  async saveLocal(data: SyncableData): Promise<boolean> {
    try {
      if (isTauriEnvironment()) {
        return await saveDataNative(data);
      } else {
        localStorage.setItem('hybridAppData', JSON.stringify(data));
        return true;
      }
    } catch (error) {
      console.error('❌ Error saving data locally:', error);
      return false;
    }
  }

  /**
   * טעינת נתונים מקומית
   */
  async loadLocal(): Promise<SyncableData | null> {
    try {
      if (isTauriEnvironment()) {
        return await loadDataNative();
      } else {
        const data = localStorage.getItem('hybridAppData');
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      console.error('❌ Error loading local data:', error);
      return null;
    }
  }

  /**
   * סנכרון עם הענן (Supabase)
   * הפונקציה הזו תיושם כשהמשתמש יחבר את Supabase
   */
  async syncWithCloud(localData: SyncableData): Promise<{
    success: boolean;
    cloudData?: SyncableData;
    error?: string;
  }> {
    if (!this.isOnline) {
      return {
        success: false,
        error: 'אין חיבור לאינטרנט'
      };
    }

    try {
      // כאן יתבצע הסנכרון עם Supabase
      // לעת עתה נחזיר הצלחה עם הנתונים המקומיים
      console.log('🔄 Cloud sync would happen here with Supabase');
      
      return {
        success: true,
        cloudData: localData
      };
    } catch (error) {
      console.error('❌ Cloud sync error:', error);
      return {
        success: false,
        error: 'שגיאה בסנכרון עם הענן'
      };
    }
  }

  /**
   * סנכרון אוטומטי כשהחיבור מתחדש
   */
  private async handleConnectionRestored() {
    console.log('🌐 Connection restored - attempting auto-sync');
    
    const localData = await this.loadLocal();
    if (localData) {
      const result = await this.syncWithCloud(localData);
      if (result.success) {
        console.log('✅ Auto-sync completed successfully');
        this.lastSyncTime = new Date();
      }
    }
  }

  /**
   * בדיקה אם נדרש סנכרון
   */
  shouldSync(): boolean {
    if (!this.isOnline) return false;
    
    if (!this.lastSyncTime) return true;
    
    // סנכרון כל 5 דקות
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.lastSyncTime < fiveMinutesAgo;
  }

  /**
   * סטטוס הסנכרון
   */
  getSyncStatus(): {
    isOnline: boolean;
    lastSync: Date | null;
    needsSync: boolean;
    mode: 'web' | 'desktop';
  } {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSyncTime,
      needsSync: this.shouldSync(),
      mode: isTauriEnvironment() ? 'desktop' : 'web'
    };
  }
}

// Export singleton instance
export const syncService = SyncService.getInstance();