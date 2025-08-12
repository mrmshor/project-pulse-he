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
   * פתיחת אימייל עם כתובת - תיקון מלא
   */
  static async openGmail(email: string, subject?: string, body?: string): Promise<boolean> {
    try {
      console.log('📧 Opening email for:', email);
      
      let mailtoUrl = `mailto:${email}`;
      const params = [];
      
      if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      
      // ✅ תיקון: השלמת הקוד שהיה חסר
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
}

// Export legacy functions for backward compatibility
export const openWhatsApp = ClientContactService.openWhatsApp;
export const openMail = ClientContactService.openGmail;
export const openPhone = ClientContactService.dialNumber;
