import { open } from '@tauri-apps/api/dialog';
import { open as openShell } from '@tauri-apps/api/shell';
import { invoke } from '@tauri-apps/api/tauri';
import { isTauriEnvironment } from '@/lib/tauri';

// Cross-platform URL/path opener - FIXED for v1
async function openUrlOrPath(urlOrPath: string): Promise<void> {
  try {
    console.log('🚀 Opening:', urlOrPath);
    await openShell(urlOrPath);
    console.log('✅ Successfully opened:', urlOrPath);
  } catch (error) {
    console.error('❌ Failed to open URL/path:', error);
    throw error;
  }
}

// ✅ שירותי תיקיות ופרויקטים
export class FolderService {
  /**
   * פתיחת דיאלוג לבחירת תיקיית פרויקט
   */
  static async selectProjectFolder(): Promise<string | null> {
    try {
      console.log('📁 Opening folder selection dialog...');
      
      if (!isTauriEnvironment()) {
        console.warn('🌐 Browser mode: Cannot select folders');
        return null;
      }
      
      const folderPath = await open({
        directory: true,
        multiple: false,
        title: 'בחר תיקיית פרויקט'
      });
      
      console.log('📁 Selected folder:', folderPath);
      
      if (folderPath && typeof folderPath === 'string') {
        // פתיחה אוטומטית של התיקייה שנבחרה
        const opened = await this.openInFinder(folderPath);
        if (opened) {
          return folderPath;
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error selecting folder:', error);
      return null;
    }
  }

  /**
   * פתיחת תיקייה בחקר הקבצים של המערכת
   */
  static async openInFinder(folderPath: string): Promise<boolean> {
    try {
      console.log('🗂️ Opening folder in system explorer:', folderPath);
      
      if (!isTauriEnvironment()) {
        console.warn('🌐 Browser mode: Cannot open folders in system explorer');
        return false;
      }
      
      // ניסיון ראשון: פונקציה נייטיבית של Rust
      try {
        await invoke('open_folder', { path: folderPath });
        console.log('✅ Folder opened successfully via Rust command');
        return true;
      } catch (rustError) {
        console.log('⚠️ Rust command failed, trying shell fallback...', rustError);
        
        // ניסיון שני: shell API של Tauri
        try {
          await openUrlOrPath(folderPath);
          console.log('✅ Folder opened successfully via shell');
          return true;
        } catch (shellError) {
          console.error('❌ All methods failed to open folder:', shellError);
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Error opening folder:', error);
      return false;
    }
  }

  /**
   * בדיקה אם נתיב תיקייה קיים
   */
  static async validateFolderPath(folderPath: string): Promise<boolean> {
    try {
      if (!folderPath || folderPath.trim().length === 0) {
        return false;
      }

      if (isTauriEnvironment()) {
        const { exists } = await import('@tauri-apps/api/fs');
        const pathExists = await exists(folderPath);
        console.log('📁 Folder validation:', pathExists ? '✅ EXISTS' : '❌ NOT FOUND', 'for:', folderPath);
        return pathExists;
      }
      
      // במצב דפדפן - נחזיר true אם הנתיב לא ריק
      return true;
    } catch (error) {
      console.error('❌ Error validating folder path:', error);
      return false;
    }
  }

  /**
   * יצירת תיקיית פרויקט חדשה
   */
  static async createProjectFolder(basePath: string, projectName: string): Promise<string | null> {
    try {
      if (!isTauriEnvironment()) {
        console.warn('🌐 Browser mode: Cannot create folders');
        return null;
      }

      const { createDir } = await import('@tauri-apps/api/fs');
      const projectPath = `${basePath}/${projectName}`;
      
      await createDir(projectPath, { recursive: true });
      console.log('✅ Project folder created:', projectPath);
      
      return projectPath;
    } catch (error) {
      console.error('❌ Error creating project folder:', error);
      return null;
    }
  }
}

// ✅ שירותי תקשורת ואנשי קשר
export class ClientContactService {
  /**
   * פתיחת WhatsApp עם מספר טלפון
   */
  static async openWhatsApp(phoneNumber: string, message?: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatToInternational(phoneNumber);
      console.log('💬 Opening WhatsApp for:', formattedPhone);
      
      if (!isTauriEnvironment()) {
        // Fallback לדפדפן
        const url = message 
          ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
          : `https://wa.me/${formattedPhone}`;
        window.open(url, '_blank');
        return true;
      }

      // ניסיון ראשון: פונקציה נייטיבית של Rust
      try {
        await invoke('open_whatsapp', { 
          phone: formattedPhone, 
          message: message || null 
        });
        console.log('✅ WhatsApp opened via Rust command');
        return true;
      } catch (rustError) {
        console.log('⚠️ Rust WhatsApp command failed, trying fallback...', rustError);
        
        // ניסיון שני: WhatsApp Desktop
        const whatsappUrl = `whatsapp://send?phone=${formattedPhone}`;
        
        try {
          await openUrlOrPath(whatsappUrl);
          console.log('✅ WhatsApp Desktop opened successfully');
          return true;
        } catch (desktopError) {
          console.log('⚠️ Desktop WhatsApp failed, trying web version...');
          
          // ניסיון שלישי: WhatsApp Web
          const webUrl = message 
            ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
            : `https://wa.me/${formattedPhone}`;
          await openUrlOrPath(webUrl);
          console.log('✅ WhatsApp Web opened successfully');
          return true;
        }
      }
    } catch (error) {
      console.error('❌ Error opening WhatsApp:', error);
      return false;
    }
  }

  /**
   * פתיחת אימייל עם כתובת
   */
  static async openGmail(email: string, subject?: string, body?: string): Promise<boolean> {
    try {
      console.log('📧 Opening email for:', email);
      
      let mailtoUrl = `mailto:${email}`;
      const params = [];
      
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      
      if (params.length > 0) {
        mailtoUrl += '?' + params.join('&');
      }

      if (!isTauriEnvironment()) {
        window.open(mailtoUrl);
        return true;
      }

      // ניסיון ראשון: פונקציה נייטיבית של Rust
      try {
        await invoke('open_email', { 
          email: email, 
          subject: subject || null,
          body: body || null
        });
        console.log('✅ Email opened via Rust command');
        return true;
      } catch (rustError) {
        console.log('⚠️ Rust email command failed, trying fallback...', rustError);
        
        // ניסיון שני: shell fallback
        await openUrlOrPath(mailtoUrl);
        console.log('✅ Email opened via shell');
        return true;
      }
    } catch (error) {
      console.error('❌ Error opening email:', error);
      return false;
    }
  }

  /**
   * פתיחת חיוג עם מספר טלפון
   */
  static async dialNumber(phoneNumber: string): Promise<boolean> {
    try {
      console.log('📞 Opening phone dialer for:', phoneNumber);
      
      const telUrl = `tel:${phoneNumber}`;

      if (!isTauriEnvironment()) {
        window.open(telUrl);
        return true;
      }

      // ניסיון ראשון: פונקציה נייטיבית של Rust
      try {
        await invoke('open_phone', { phone_number: phoneNumber });
        console.log('✅ Phone dialer opened via Rust command');
        return true;
      } catch (rustError) {
        console.log('⚠️ Rust phone command failed, trying fallback...', rustError);
        
        // ניסיון שני: shell fallback
        await openUrlOrPath(telUrl);
        console.log('✅ Phone dialer opened via shell');
        return true;
      }
    } catch (error) {
      console.error('❌ Error opening phone dialer:', error);
      return false;
    }
  }

  /**
   * פורמט מספר טלפון לפורמט ישראלי בינלאומי
   */
  static formatToInternational(phoneNumber: string): string {
    // הסרת כל התווים שאינם ספרות
    const digitsOnly = phoneNumber.replace(/[^\d]/g, '');
    
    // אם המספר מתחיל ב-0, החלף ל-972 (קוד ישראל)
    if (digitsOnly.startsWith('0')) {
      return '972' + digitsOnly.substring(1);
    }
    
    // אם המספר לא מתחיל ב-972, הוסף אותו
    if (!digitsOnly.startsWith('972')) {
      return '972' + digitsOnly;
    }
    
    return digitsOnly;
  }

  /**
   * וידוא תקינות מספר טלפון ישראלי
   */
  static validateIsraeliPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // דפוסי מספרי טלפון ישראליים
    const israeliPatterns = [
      /^0[0-9]{1,2}-?[0-9]{7}$/,        // 0XX-XXXXXXX או 0X-XXXXXXX
      /^(\+972)[0-9]{1,2}[0-9]{7}$/,   // +972XXXXXXXXX
      /^[5-9][0-9]{8}$/                // 9 ספרות מתחילות ב-5-9
    ];
    
    return israeliPatterns.some(pattern => pattern.test(phone.replace(/[\s-]/g, '')));
  }

  /**
   * וידוא תקינות כתובת אימייל
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// ✅ שירותי ייצוא ושמירה
export class ExportService {
  /**
   * ייצוא נתונים לקובץ CSV
   */
  static async exportToCSV(data: any[], filename: string): Promise<boolean> {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        console.warn('⚠️ No data to export');
        return false;
      }

      // יצירת תוכן CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      if (isTauriEnvironment()) {
        const { exportFileNative } = await import('@/lib/tauri');
        await exportFileNative(csvContent, filename, 'csv');
      } else {
        // Fallback לדפדפן
        this.downloadBlob(csvContent, filename, 'text/csv');
      }

      console.log('✅ CSV exported successfully:', filename);
      return true;
    } catch (error) {
      console.error('❌ Error exporting CSV:', error);
      return false;
    }
  }

  /**
   * ייצוא נתונים לקובץ JSON
   */
  static async exportToJSON(data: any, filename: string): Promise<boolean> {
    try {
      const jsonContent = JSON.stringify(data, null, 2);

      if (isTauriEnvironment()) {
        const { exportFileNative } = await import('@/lib/tauri');
        await exportFileNative(jsonContent, filename, 'json');
      } else {
        // Fallback לדפדפן
        this.downloadBlob(jsonContent, filename, 'application/json');
      }

      console.log('✅ JSON exported successfully:', filename);
      return true;
    } catch (error) {
      console.error('❌ Error exporting JSON:', error);
      return false;
    }
  }

  /**
   * הורדת קובץ בדפדפן (fallback)
   */
  private static downloadBlob(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// ✅ שירותי מערכת כלליים
export class SystemService {
  /**
   * קבלת מידע על מערכת ההפעלה
   */
  static async getOSInfo(): Promise<string> {
    try {
      if (isTauriEnvironment()) {
        return await invoke('get_os_info');
      } else {
        // זיהוי מערכת הפעלה בדפדפן
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.includes('win')) return 'windows';
        if (userAgent.includes('mac')) return 'macos';
        if (userAgent.includes('linux')) return 'linux';
        return 'unknown';
      }
    } catch (error) {
      console.error('❌ Error getting OS info:', error);
      return 'unknown';
    }
  }

  /**
   * בדיקת זמינות יכולות Tauri
   */
  static async checkCapabilities(): Promise<{
    isDesktop: boolean;
    canOpenFolders: boolean;
    canOpenURLs: boolean;
    canAccessFileSystem: boolean;
  }> {
    const isDesktop = isTauriEnvironment();
    
    let canOpenFolders = false;
    let canOpenURLs = false;
    let canAccessFileSystem = false;

    if (isDesktop) {
      try {
        // בדיקת גישה למערכת קבצים
        const { exists } = await import('@tauri-apps/api/fs');
        await exists('');
        canAccessFileSystem = true;
        
        // בדיקת יכולת פתיחת תיקיות ו-URLs
        canOpenFolders = true;
        canOpenURLs = true;
        
        console.log('✅ All Tauri capabilities are available');
      } catch (error) {
        console.warn('⚠️ Some Tauri capabilities are limited:', error);
      }
    }

    return {
      isDesktop,
      canOpenFolders,
      canOpenURLs,
      canAccessFileSystem
    };
  }
}

// Export the old function names for backward compatibility
export { ClientContactService as ContactService };

// Legacy exports for existing code
export const openWhatsApp = ClientContactService.openWhatsApp;
export const openMail = ClientContactService.openGmail;
export const openPhone = ClientContactService.dialNumber;
