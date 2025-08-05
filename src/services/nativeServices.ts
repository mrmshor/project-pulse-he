import { open } from '@tauri-apps/plugin-dialog';
import { Command } from '@tauri-apps/plugin-shell';
import { isTauriEnvironment } from '@/lib/tauri';

export class FolderService {
  // בחירת תיקיה דרך Finder/Explorer
  static async selectProjectFolder(): Promise<string | null> {
    if (!isTauriEnvironment()) {
      alert('פיצ\'ר זה זמין רק בגרסת הדסקטופ');
      return null;
    }

    try {
      const folderPath = await open({
        directory: true,
        multiple: false,
        title: 'בחר תיקיית פרויקט'
      });
      
      return folderPath as string | null;
    } catch (error) {
      console.error('שגיאה בבחירת תיקיה:', error);
      return null;
    }
  }

  // פתיחת תיקיה ב-Finder/Explorer
  static async openInFinder(folderPath: string): Promise<boolean> {
    if (!isTauriEnvironment()) {
      // Fallback for web - copy path to clipboard
      try {
        await navigator.clipboard.writeText(folderPath);
        alert(`נתיב התיקיה הועתק: ${folderPath}`);
        return true;
      } catch (error) {
        console.error('לא ניתן להעתיק נתיב:', error);
        return false;
      }
    }

    try {
      await Command.create('open', [folderPath]).execute();
      return true;
    } catch (error) {
      console.error('שגיאה בפתיחת תיקיה:', error);
      return false;
    }
  }

  // בדיקה אם תיקיה קיימת
  static async validateFolderPath(folderPath: string): Promise<boolean> {
    if (!isTauriEnvironment()) {
      return true; // Can't validate in web, assume valid
    }

    try {
      await Command.create('test', ['-d', folderPath]).execute();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export class ClientContactService {
  // פתיחת WhatsApp Desktop
  static async openWhatsApp(phoneNumber: string): Promise<boolean> {
    try {
      // ניקוי מספר טלפון
      const cleanPhone = phoneNumber.replace(/\D/g, '');
      const israeliPhone = cleanPhone.startsWith('0') 
        ? `972${cleanPhone.substring(1)}` 
        : cleanPhone;
      
      if (isTauriEnvironment()) {
        await Command.create('open', [`whatsapp://send?phone=${israeliPhone}`]).execute();
      } else {
        // Web fallback
        window.open(`https://wa.me/${israeliPhone}`, '_blank');
      }
      return true;
    } catch (error) {
      console.error('שגיאה בפתיחת WhatsApp:', error);
      // נסה WhatsApp Web כגיבוי
      try {
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        const israeliPhone = cleanPhone.startsWith('0') 
          ? `972${cleanPhone.substring(1)}` 
          : cleanPhone;
        
        if (isTauriEnvironment()) {
          await Command.create('open', [`https://wa.me/${israeliPhone}`]).execute();
        } else {
          window.open(`https://wa.me/${israeliPhone}`, '_blank');
        }
        return true;
      } catch (webError) {
        return false;
      }
    }
  }

  // פתיחת Gmail עם כתובת מוכנה
  static async openGmail(email: string, subject?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${email}&${params.toString()}`;
      
      if (isTauriEnvironment()) {
        await Command.create('open', [gmailUrl]).execute();
      } else {
        window.open(gmailUrl, '_blank');
      }
      return true;
    } catch (error) {
      console.error('שגיאה בפתיחת Gmail:', error);
      // נסה mailto כגיבוי
      try {
        const mailtoUrl = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
        
        if (isTauriEnvironment()) {
          await Command.create('open', [mailtoUrl]).execute();
        } else {
          window.open(mailtoUrl);
        }
        return true;
      } catch (mailtoError) {
        return false;
      }
    }
  }

  // חיוג נייטיבי
  static async dialNumber(phoneNumber: string): Promise<boolean> {
    try {
      const telUrl = `tel:${phoneNumber}`;
      
      if (isTauriEnvironment()) {
        await Command.create('open', [telUrl]).execute();
      } else {
        window.open(telUrl);
      }
      return true;
    } catch (error) {
      console.error('שגיאה בחיוג:', error);
      // העתק למקלדת כגיבוי
      try {
        await navigator.clipboard.writeText(phoneNumber);
        alert(`מספר הטלפון הועתק: ${phoneNumber}`);
        return true;
      } catch (clipboardError) {
        return false;
      }
    }
  }

  // ולידציה של מספר טלפון ישראלי
  static validateIsraeliPhone(phone: string): boolean {
    const phoneRegex = /^0[0-9]{1,2}-?[0-9]{7}$|^[0-9]{10}$/;
    return phoneRegex.test(phone);
  }

  // ולידציה של אימייל
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}