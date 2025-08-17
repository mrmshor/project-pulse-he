import { open as openDialog } from '@tauri-apps/plugin-dialog';

import { exists } from '@tauri-apps/plugin-fs';
import { invoke } from '@tauri-apps/api/core';
import { formatPhoneForWhatsApp, isTauriEnvironment } from '@/lib/tauri';
import { DesktopCompanionService } from './desktopCompanionService';

// ✅ שירותי תיקיות ופרויקטים
export class FolderService {
  /**
   * פתיחת דיאלוג לבחירת תיקיית פרויקט
   */
  static async selectProjectFolder(): Promise<string | null> {
    try {
      console.log('📁 Opening folder selection dialog...');
      
      if (isTauriEnvironment()) {
        // בסביבת Tauri - שימוש ב-plugin
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
      } else {
        // בדפדפן - ניסיון דרך Desktop Companion
        console.log('🌐 Browser mode: Trying Desktop Companion...');
        const selectedPath = await DesktopCompanionService.selectFolder();
        
        if (selectedPath) {
          // פתיחה אוטומטית של התיקייה שנבחרה
          await this.openInFinder(selectedPath);
          return selectedPath;
        }
        
        console.warn('🌐 Browser mode & Desktop Companion not available: Cannot select folders');
        return null;
      }
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
      
      if (isTauriEnvironment()) {
        // בסביבת Tauri - שימוש ב-invoke
        await invoke('open_folder', { path: folderPath });
        console.log('✅ Folder opened successfully via Tauri');
        return true;
      } else {
        // בדפדפן - ניסיון דרך Desktop Companion
        console.log('🌐 Browser mode: Trying Desktop Companion...');
        const success = await DesktopCompanionService.openFolder(folderPath);
        
        if (success) {
          console.log('✅ Folder opened successfully via Desktop Companion');
          return true;
        } else {
          console.warn('🌐 Browser mode & Desktop Companion not available: Cannot open folders');
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
        // בסביבת Tauri - נשתמש ב-fs plugin לבדיקה
        const pathExists = await exists(folderPath);
        console.log('📁 Folder validation via Tauri:', pathExists ? '✅ EXISTS' : '❌ NOT FOUND', 'for:', folderPath);
        return pathExists;
      } else {
        // בדפדפן - ניסיון דרך Desktop Companion
        const pathExists = await DesktopCompanionService.validateFolder(folderPath);
        console.log('📁 Folder validation via Desktop Companion:', pathExists ? '✅ EXISTS' : '❌ NOT FOUND', 'for:', folderPath);
        return pathExists;
      }
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
      const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
      console.log('💬 Opening WhatsApp for:', formattedPhone);
      
      if (!isTauriEnvironment()) {
        // Fallback לדפדפן
        const url = message 
          ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
          : `https://wa.me/${formattedPhone}`;
        window.open(url, '_blank');
        return true;
      }

      // שימוש בפונקציה המאוחדת מ-tauri.ts
      await invoke('open_whatsapp', { 
        phone: formattedPhone,
        message: message || null
      });
      
      console.log('✅ WhatsApp opened successfully');
      return true;
    } catch (error) {
      console.error('❌ Error opening WhatsApp:', error);
      
      // Fallback לדפדפן במקרה של שגיאה
      try {
        const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
        const url = message 
          ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
          : `https://wa.me/${formattedPhone}`;
        window.open(url, '_blank');
        return true;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        return false;
      }
    }
  }

  /**
   * פתיחת אימייל עם כתובת
   */
  static async openGmail(email: string, subject?: string, body?: string): Promise<boolean> {
    try {
      console.log('📧 Opening email for:', email);
      
      if (!isTauriEnvironment()) {
        // Fallback לדפדפן
        let mailtoUrl = `mailto:${email}`;
        const params: string[] = [];
        
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        
        const a = document.createElement('a');
        a.href = mailtoUrl;
        a.target = '_top'; // break out of iframe if needed
        a.rel = 'noreferrer noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        // Fallback in case the click is blocked by the iframe/browser
        try { (window.top || window).location.href = mailtoUrl; } catch (_) {}
        document.body.removeChild(a);
        return true;
      }

      // שימוש בפונקציה המאוחדת מ-tauri.ts
      await invoke('open_email', { 
        email: email,
        subject: subject || null,
        body: body || null
      });
      
      console.log('✅ Email opened successfully');
      return true;
    } catch (error) {
      console.error('❌ Error opening email:', error);
      
      // Fallback לדפדפן במקרה של שגיאה
      try {
        let mailtoUrl = `mailto:${email}`;
        const params: string[] = [];
        
        if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
        if (body) params.push(`body=${encodeURIComponent(body)}`);
        
        if (params.length > 0) {
          mailtoUrl += '?' + params.join('&');
        }
        
        const a = document.createElement('a');
        a.href = mailtoUrl;
        a.target = '_top';
        a.rel = 'noreferrer noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        try { (window.top || window).location.href = mailtoUrl; } catch (_) {}
        document.body.removeChild(a);
        return true;
      } catch (fallbackError) {
        console.error('❌ Email fallback also failed:', fallbackError);
        return false;
      }
    }
  }

  /**
   * פתיחת חייגן טלפון
   */
  static async openPhone(phoneNumber: string): Promise<boolean> {
    try {
      console.log('📞 Opening phone dialer for:', phoneNumber);
      
      const phoneUrl = `tel:${phoneNumber}`;
      
      if (!isTauriEnvironment()) {
        window.open(phoneUrl, '_blank');
        return true;
      }

      // שימוש בפונקציה המאוחדת מ-tauri.ts
      await invoke('open_url', { url: phoneUrl });
      
      console.log('✅ Phone dialer opened successfully');
      return true;
    } catch (error) {
      console.error('❌ Error opening phone dialer:', error);
      
      // Fallback לדפדפן במקרה של שגיאה
      try {
        window.open(`tel:${phoneNumber}`, '_blank');
        return true;
      } catch (fallbackError) {
        console.error('❌ Phone fallback also failed:', fallbackError);
        return false;
      }
    }
  }

  /**
   * בדיקת חיבור Tauri (לטסטים)
   */
  static async testTauriConnection(): Promise<boolean> {
    try {
      if (!isTauriEnvironment()) {
        console.log('🌐 Browser mode: Tauri not available');
        return false;
      }

      const result = await invoke('test_connection');
      console.log('🔍 Tauri connection test:', result);
      return true;
    } catch (error) {
      console.error('❌ Tauri connection test failed:', error);
      return false;
    }
  }
}
