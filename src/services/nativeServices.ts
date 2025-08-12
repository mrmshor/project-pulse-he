import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { openPath, openUrl } from '@tauri-apps/plugin-opener';
import { exists } from '@tauri-apps/plugin-fs';

// בדיקה אם אנחנו בסביבת Tauri
function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
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
      
      const folderPath = await openDialog({
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
      
      // 🆕 שימוש ב-plugin-opener במקום invoke
      await openPath(folderPath);
      console.log('✅ Folder opened successfully');
      return true;
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
        // בסביבת Tauri - נשתמש ב-fs plugin לבדיקה
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

      // 🆕 שימוש ב-plugin-opener במקום invoke
      try {
        // ניסיון ראשון: WhatsApp Desktop
        const whatsappUrl = `whatsapp://send?phone=${formattedPhone}`;
        await openUrl(whatsappUrl);
        console.log('✅ WhatsApp Desktop opened successfully');
        return true;
      } catch (desktopError) {
        console.log('⚠️ Desktop WhatsApp failed, trying web version...');
        
        // ניסיון שני: WhatsApp Web
        const webUrl = message 
          ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
          : `https://wa.me/${formattedPhone}`;
        await openUrl(webUrl);
        console.log('✅ WhatsApp Web opened successfully');
        return true;
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
        // Fallback לדפדפן
        window.open(mailtoUrl, '_blank');
        return true;
      }

      // 🆕 שימוש ב-plugin-opener במקום invoke
      await openUrl(mailtoUrl);
      console.log('✅ Email opened successfully');
      return true;
    } catch (error) {
      console.error('❌ Error opening email:', error);
      return false;
    }
  }

  /**
   * המרת מספר טלפון לפורמט בינלאומי
   */
  private static formatToInternational(phoneNumber: string): string {
    // הסרת תווים שאינם ספרות
    const cleaned = phoneNumber.replace(/[^0-9]/g, '');
    
    // המרה מפורמט ישראלי (0XX) לבינלאומי (972XX)
    if (cleaned.startsWith('0')) {
      return '972' + cleaned.substring(1);
    }
    
    // אם כבר מתחיל ב-972, נחזיר כמו שהוא
    if (cleaned.startsWith('972')) {
      return cleaned;
    }
    
    // אחרת, נניח שזה מספר ישראלי ללא 0 בהתחלה
    return '972' + cleaned;
  }
}
