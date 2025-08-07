import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { open as openUrl } from '@tauri-apps/plugin-opener';

export class FolderService {
  // Select project folder - Finder/Explorer
  static async selectProjectFolder(): Promise<string | null> {
    try {
      const folderPath = await openDialog({
        directory: true,
        multiple: false,
        title: 'Select Project Folder'
      });
      
      if (folderPath) {
        // Auto-open the folder in Finder
        await this.openInFinder(folderPath as string);
        return folderPath as string;
      }
      return null;
    } catch (error) {
      console.error('Error selecting folder:', error);
      return null;
    }
  }

  // Open folder in Finder/Explorer
  static async openInFinder(folderPath: string): Promise<boolean> {
    try {
      // Use Tauri v2 opener plugin
      await openUrl(folderPath);
      console.log('Folder opened successfully:', folderPath);
      return true;
    } catch (error) {
      console.error('Cannot open folder path:', error);
      return false;
    }
  }

  // Check if folder exists - simple validation (function not currently used in code)
  static async validateFolderPath(folderPath: string): Promise<boolean> {
    try {
      // Due to Tauri security limitations, return true if path looks valid
      return folderPath && folderPath.length > 0;
    } catch (error) {
      console.error('Cannot validate folder:', error);
      return false;
    }
  }
}

export class ClientContactService {
  // Open desktop WhatsApp
  static async openWhatsApp(phoneNumber: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatToInternational(phoneNumber);
      
      // First attempt - Desktop WhatsApp
      const whatsappUrl = `whatsapp://send?phone=${formattedPhone}`;
      
      try {
        await openUrl(whatsappUrl);
        console.log('WhatsApp opened successfully:', formattedPhone);
        return true;
      } catch (desktopError) {
        console.log('Desktop WhatsApp failed, trying web version...');
        
        // Fallback - WhatsApp Web
        const webUrl = `https://wa.me/${formattedPhone}`;
        await openUrl(webUrl);
        console.log('WhatsApp Web opened:', formattedPhone);
        return true;
      }
      
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      return false;
    }
  }

  // Open Gmail with preset subject
  static async openGmail(email: string, subject?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${email}&${params.toString()}`;
      
      await openUrl(gmailUrl);
      console.log('Gmail opened for:', email);
      return true;
    } catch (error) {
      console.error('Error opening Gmail:', error);
      
      // Fallback to general email
      try {
        const mailtoUrl = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
        await openUrl(mailtoUrl);
        console.log('Mailto fallback used for:', email);
        return true;
      } catch (mailtoError) {
        console.error('Mailto fallback failed:', mailtoError);
        return false;
      }
    }
  }

  // Dial phone number
  static async dialNumber(phoneNumber: string): Promise<boolean> {
    try {
      const telUrl = `tel:${phoneNumber}`;
      await openUrl(telUrl);
      console.log('Dialing:', phoneNumber);
      return true;
    } catch (error) {
      console.error('Error dialing number:', error);
      return false;
    }
  }

  // Validate Israeli phone number (and international)
  static validateIsraeliPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    
    const israeliPatterns = [
      /^0[0-9]{1,2}-?[0-9]{7}$/, // Local format
      /^(\+972)[0-9]{1,2}[0-9]{7}$/, // International format
      /^[5-9][0-9]{8}$/ // Without leading 0
    ];
    
    return israeliPatterns.some(pattern => pattern.test(phone.replace(/[\s-]/g, '')));
  }

  // Format to international number
  static formatToInternational(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Israeli starting with 972
    if (cleanPhone.startsWith('972')) {
      return cleanPhone;
    }
    
    // Israeli starting with 0
    if (cleanPhone.startsWith('0') && cleanPhone.length >= 9) {
      return `972${cleanPhone.substring(1)}`;
    }
    
    // Number starting with 5 in Israel 9 digits
    if (cleanPhone.startsWith('5') && cleanPhone.length === 9) {
      return `972${cleanPhone}`;
    }
    
    // American/Canadian starting with +1
    if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
      return cleanPhone;
    }
    
    // General format
    if (cleanPhone.startsWith('+')) {
      return cleanPhone.substring(1); // Remove + if exists
    }
    
    return cleanPhone;
  }

  // Email validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
