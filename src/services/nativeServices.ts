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
      // ניקוי ופורמט מספר טלפון בינלאומי
      const formattedPhone = this.formatToInternational(phoneNumber);
      
      if (isTauriEnvironment()) {
        await Command.create('open', [`whatsapp://send?phone=${formattedPhone}`]).execute();
      } else {
        // Web fallback
        window.open(`https://wa.me/${formattedPhone}`, '_blank');
      }
      return true;
    } catch (error) {
      console.error('שגיאה בפתיחת WhatsApp:', error);
      // נסה WhatsApp Web כגיבוי
      try {
        const formattedPhone = this.formatToInternational(phoneNumber);
        
        if (isTauriEnvironment()) {
          await Command.create('open', [`https://wa.me/${formattedPhone}`]).execute();
        } else {
          window.open(`https://wa.me/${formattedPhone}`, '_blank');
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

  // פורמט מספר לפורמט בינלאומי
  static formatToInternational(phone: string): string {
    // הסרת כל התווים שאינם ספרות
    const cleanPhone = phone.replace(/\D/g, '');
    
    // אם המספר מתחיל ב-972, הוא כבר בפורמט בינלאומי
    if (cleanPhone.startsWith('972')) {
      return cleanPhone;
    }
    
    // אם המספר מתחיל ב-0, זה מספר ישראלי מקומי
    if (cleanPhone.startsWith('0') && cleanPhone.length >= 9) {
      return `972${cleanPhone.substring(1)}`;
    }
    
    // אם המספר מתחיל ב-5 ובאורך 9 ספרות, זה ככל הנראה ישראלי ללא 0
    if (cleanPhone.startsWith('5') && cleanPhone.length === 9) {
      return `972${cleanPhone}`;
    }
    
    // אם המספר מתחיל ב-+ אז זה כבר בפורמט בינלאומי
    if (phone.startsWith('+')) {
      return cleanPhone;
    }
    
    // אחרת מחזיר את המספר כפי שהוא
    return cleanPhone;
  }

  // ולידציה של מספר טלפון בינלאומי
  static validateInternationalPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // פורמטים מקובלים:
    // +972-XX-XXXXXXX (ישראל)
    // +1-XXX-XXX-XXXX (ארה"ב/קנדה)
    // +44-XX-XXXX-XXXX (בריטניה)
    // +33-X-XX-XX-XX-XX (צרפת)
    // +49-XXX-XXXXXXX (גרמניה)
    
    const patterns = [
      // ישראל: +972-XX-XXXXXXX או 0XX-XXXXXXX
      /^(\+?972|0)[0-9]{1,2}[-\s]?[0-9]{7}$/,
      // ארה"ב/קנדה: +1-XXX-XXX-XXXX
      /^(\+?1)[0-9]{3}[-\s]?[0-9]{3}[-\s]?[0-9]{4}$/,
      // בריטניה: +44-XX-XXXX-XXXX
      /^(\+?44)[0-9]{2}[-\s]?[0-9]{4}[-\s]?[0-9]{4}$/,
      // פורמט כללי לקידומות אחרות
      /^(\+?[1-9][0-9]{0,3})[0-9]{6,14}$/
    ];
    
    return patterns.some(pattern => pattern.test(phone.replace(/[\s-]/g, '')));
  }

  // ולידציה של מספר טלפון ישראלי (לתאימות לאחור)
  static validateIsraeliPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // פורמטים ישראליים:
    // 0XX-XXXXXXX או 05X-XXXXXXX
    // +972-XX-XXXXXXX
    // 972XXXXXXXXX
    
    const israeliPatterns = [
      /^0[0-9]{1,2}-?[0-9]{7}$/, // פורמט מקומי
      /^(\+?972)[0-9]{1,2}[0-9]{7}$/, // פורמט בינלאומי
      /^[5-9][0-9]{8}$/ // ללא 0 בהתחלה
    ];
    
    return israeliPatterns.some(pattern => pattern.test(phone.replace(/[\s-]/g, '')));
  }

  // פורמט יפה למספר טלפון
  static formatPhoneDisplay(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // ישראל
    if (cleanPhone.startsWith('972')) {
      const localPart = cleanPhone.substring(3);
      return `+972-${localPart.substring(0, 2)}-${localPart.substring(2)}`;
    }
    
    // ארה"ב/קנדה
    if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
      return `+1-${cleanPhone.substring(1, 4)}-${cleanPhone.substring(4, 7)}-${cleanPhone.substring(7)}`;
    }
    
    // פורמט כללי
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // ישראלי מקומי
    if (cleanPhone.startsWith('0') && cleanPhone.length >= 9) {
      return `${cleanPhone.substring(0, 3)}-${cleanPhone.substring(3)}`;
    }
    
    return phone;
  }

  // ולידציה של אימייל
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}