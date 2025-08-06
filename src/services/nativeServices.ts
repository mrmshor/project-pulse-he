import { open } from '@tauri-apps/plugin-dialog';
import { Command } from '@tauri-apps/plugin-shell';
import { invoke } from '@tauri-apps/api/core';

export class FolderService {
  // בחירת תיקיית פרויקט - Finder/Explorer
  static async selectProjectFolder(): Promise<string | null> {
    try {
      const folderPath = await open({
        directory: true,
        multiple: false,
        title: 'בחר תיקיית פרויקט'
      });
      
      if (folderPath) {
        // פתח את התיקיה ב-Finder אוטומטית
        await this.openInFinder(folderPath as string);
        return folderPath as string;
      }
      return null;
    } catch (error) {
      console.error('שגיאה בבחירת תיקיה:', error);
      return null;
    }
  }

  // פתיחת תיקיה ב-Finder/Explorer
  static async openInFinder(folderPath: string): Promise<boolean> {
    try {
      await invoke('open_path', { path: folderPath });
      return true;
    } catch (error) {
      console.error('לא ניתן לפתיחה נתיב:', error);
      return false;
    }
  }

  // בדיקת אם תיקיית קיימת
  static async validateFolderPath(folderPath: string): Promise<boolean> {
    try {
      await invoke('validate_path', { path: folderPath });
      return true;
    } catch (error) {
      return false;
    }
  }
}

export class ClientContactService {
  // פתיחת WhatsApp שולחני
  static async openWhatsApp(phoneNumber: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatToInternational(phoneNumber);
      const whatsappUrl = `whatsapp://send?phone=${formattedPhone}`;
      
      await invoke('open_url', { url: whatsappUrl });
      return true;
    } catch (error) {
      console.error('שגיאה בפתיחת WhatsApp:', error);
      // Fallback לדפדפן
      try {
        const webUrl = `https://wa.me/${this.formatToInternational(phoneNumber)}`;
        await invoke('open_url', { url: webUrl });
        return true;
      } catch (webError) {
        return false;
      }
    }
  }

  // פתיחת Gmail עם נושא פתוח
  static async openGmail(email: string, subject?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${email}&${params.toString()}`;
      
      await invoke('open_url', { url: gmailUrl });
      return true;
    } catch (error) {
      console.error('שגיאה בפתיחת Gmail:', error);
      // Fallback למייל כללי
      try {
        const mailtoUrl = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
        await invoke('open_url', { url: mailtoUrl });
        return true;
      } catch (mailtoError) {
        return false;
      }
    }
  }

  // חיוג מספר טלפון
  static async dialNumber(phoneNumber: string): Promise<boolean> {
    try {
      const telUrl = `tel:${phoneNumber}`;
      await invoke('open_url', { url: telUrl });
      return true;
    } catch (error) {
      console.error('שגיאה בחיוג:', error);
      return false;
    }
  }

  // ולידציה של מספר טלפון ישראלי (ואינטרנציונלי)
  static validateIsraeliPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    
    const israeliPatterns = [
      /^0[0-9]{1,2}-?[0-9]{7}$/, // פורמט מקומי
      /^(\+972)[0-9]{1,2}[0-9]{7}$/, // פורמט בינלאומי
      /^[5-9][0-9]{8}$/ // ללא 0 בהתחלה
    ];
    
    return israeliPatterns.some(pattern => pattern.test(phone.replace(/[\s-]/g, '')));
  }

  // פורמט למספר בינלאומי
  static formatToInternational(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // ישראלי מתחיל ב-972
    if (cleanPhone.startsWith('972')) {
      return cleanPhone;
    }
    
    // ישראלי מתחיל ב-0
    if (cleanPhone.startsWith('0') && cleanPhone.length >= 9) {
      return `972${cleanPhone.substring(1)}`;
    }
    
    // מספר מתחיל ב-5 בארץ 9 ספרות
    if (cleanPhone.startsWith('5') && cleanPhone.length === 9) {
      return `972${cleanPhone}`;
    }
    
    // אמריקני/קנדי מתחיל ב-+1
    if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
      return cleanPhone;
    }
    
    // פורמט כללי
    if (cleanPhone.startsWith('+')) {
      return cleanPhone;
    }
    
    return cleanPhone;
  }

  // ולידציה של אימייל
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
