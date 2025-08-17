// Desktop Companion Service - מתקשר עם אפליקציית רקע שרצה על המחשב
export class DesktopCompanionService {
  private static readonly COMPANION_PORT = 7777;
  private static readonly COMPANION_URL = `http://localhost:${DesktopCompanionService.COMPANION_PORT}`;
  private static isConnected = false;
  private static lastCheckTime = 0;
  private static readonly CHECK_INTERVAL = 5000; // 5 שניות

  /**
   * בדיקת חיבור ל-Desktop Companion
   */
  static async checkConnection(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastCheckTime < this.CHECK_INTERVAL) {
      return this.isConnected;
    }

    try {
      const response = await fetch(`${this.COMPANION_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000) // 2 שניות timeout
      });
      
      this.isConnected = response.ok;
      this.lastCheckTime = now;
      
      if (this.isConnected) {
        console.log('✅ Desktop Companion מחובר');
      }
      
      return this.isConnected;
    } catch (error) {
      this.isConnected = false;
      this.lastCheckTime = now;
      console.log('❌ Desktop Companion לא מחובר');
      return false;
    }
  }

  /**
   * פתיחת תיקיה דרך Desktop Companion
   */
  static async openFolder(folderPath: string): Promise<boolean> {
    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        console.warn('Desktop Companion לא זמין');
        return false;
      }

      const response = await fetch(`${this.COMPANION_URL}/open-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath }),
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        console.log('✅ תיקיה נפתחה בהצלחה:', folderPath);
        return true;
      } else {
        console.error('❌ שגיאה בפתיחת תיקיה:', await response.text());
        return false;
      }
    } catch (error) {
      console.error('❌ שגיאה בתקשורת עם Desktop Companion:', error);
      return false;
    }
  }

  /**
   * בחירת תיקיה דרך Desktop Companion
   */
  static async selectFolder(): Promise<string | null> {
    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        console.warn('Desktop Companion לא זמין');
        return null;
      }

      const response = await fetch(`${this.COMPANION_URL}/select-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 שניות לבחירת תיקיה
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.path) {
          console.log('✅ תיקיה נבחרה:', result.path);
          return result.path;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ שגיאה בבחירת תיקיה:', error);
      return null;
    }
  }

  /**
   * בדיקת קיום תיקיה דרך Desktop Companion
   */
  static async validateFolder(folderPath: string): Promise<boolean> {
    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        return false;
      }

      const response = await fetch(`${this.COMPANION_URL}/validate-folder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath }),
        signal: AbortSignal.timeout(3000)
      });

      if (response.ok) {
        const result = await response.json();
        return result.exists === true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ שגיאה בבדיקת תיקיה:', error);
      return false;
    }
  }

  /**
   * הורדת Desktop Companion
   */
  static getDownloadInstructions(): string {
    return `
להורדת Desktop Companion:
1. לך ל-Settings בפרויקט
2. לחץ על "Download Desktop Companion"  
3. הרץ את הקובץ שהורדת
4. האפליקציה תרוץ ברקע ותאפשר פתיחת תיקיות מהדפדפן

או הורד ישירות מכאן: ${window.location.origin}/desktop-companion.exe
    `.trim();
  }

  /**
   * קבלת סטטוס חיבור
   */
  static getConnectionStatus(): { connected: boolean; url: string; port: number } {
    return {
      connected: this.isConnected,
      url: this.COMPANION_URL,
      port: this.COMPANION_PORT
    };
  }
}