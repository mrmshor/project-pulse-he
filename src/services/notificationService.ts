import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { Command } from '@tauri-apps/plugin-shell';

// Cross-platform URL/path opener using shell commands
async function openUrlOrPath(urlOrPath: string): Promise<void> {
  try {
    const userAgent = navigator.userAgent.toLowerCase();
    let command: string;
    
    if (userAgent.includes('mac')) {
      command = 'open';
    } else if (userAgent.includes('win')) {
      command = 'cmd';
    } else {
      command = 'xdg-open'; // Linux
    }
    
    if (command === 'cmd') {
      // Windows: cmd /c start "title" "url"
      const cmd = Command.create('cmd', ['/c', 'start', '', urlOrPath]);
      await cmd.execute();
    } else {
      // macOS/Linux: open "url" or xdg-open "url"
      const cmd = Command.create(command, [urlOrPath]);
      await cmd.execute();
    }
  } catch (error) {
    console.error('Failed to open URL/path:', error);
    throw error;
  }
}

export class FolderService {
  static async selectProjectFolder(): Promise<string | null> {
    try {
      const folderPath = await openDialog({
        directory: true,
        multiple: false,
        title: 'Select Project Folder'
      });
      
      if (folderPath) {
        await this.openInFinder(folderPath as string);
        return folderPath as string;
      }
      return null;
    } catch (error) {
      console.error('Error selecting folder:', error);
      return null;
    }
  }

  static async openInFinder(folderPath: string): Promise<boolean> {
    try {
      await openUrlOrPath(folderPath);
      console.log('Folder opened successfully:', folderPath);
      return true;
    } catch (error) {
      console.error('Cannot open folder path:', error);
      return false;
    }
  }

  static async validateFolderPath(folderPath: string): Promise<boolean> {
    try {
      return folderPath && folderPath.length > 0;
    } catch (error) {
      console.error('Cannot validate folder:', error);
      return false;
    }
  }
}

export class ClientContactService {
  static async openWhatsApp(phoneNumber: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatToInternational(phoneNumber);
      
      const whatsappUrl = `whatsapp://send?phone=${formattedPhone}`;
      
      try {
        await openUrlOrPath(whatsappUrl);
        console.log('WhatsApp opened successfully:', formattedPhone);
        return true;
      } catch (desktopError) {
        console.log('Desktop WhatsApp failed, trying web version...');
        
        const webUrl = `https://wa.me/${formattedPhone}`;
        await openUrlOrPath(webUrl);
        console.log('WhatsApp Web opened:', formattedPhone);
        return true;
      }
      
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      return false;
    }
  }

  static async openGmail(email: string, subject?: string): Promise<boolean> {
    try {
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${email}&${params.toString()}`;
      
      await openUrlOrPath(gmailUrl);
      console.log('Gmail opened for:', email);
      return true;
    } catch (error) {
      console.error('Error opening Gmail:', error);
      
      try {
        const mailtoUrl = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
        await openUrlOrPath(mailtoUrl);
        console.log('Mailto fallback used for:', email);
        return true;
      } catch (mailtoError) {
        console.error('Mailto fallback failed:', mailtoError);
        return false;
      }
    }
  }

  static async dialNumber(phoneNumber: string): Promise<boolean> {
    try {
      const telUrl = `tel:${phoneNumber}`;
      await openUrlOrPath(telUrl);
      console.log('Dialing:', phoneNumber);
      return true;
    } catch (error) {
      console.error('Error dialing number:', error);
      return false;
    }
  }

  static validateIsraeliPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    
    const israeliPatterns = [
      /^0[0-9]{1,2}-?[0-9]{7}$/,
      /^(\+972)[0-9]{1,2}[0-9]{7}$/,
      /^[5-9][0-9]{8}$/
    ];
    
    return israeliPatterns.some(pattern => pattern.test(phone.replace(/[\s-]/g, '')));
  }

  static formatToInternational(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.startsWith('972')) {
      return cleanPhone;
    }
    
    if (cleanPhone.startsWith('0') && cleanPhone.length >= 9) {
      return `972${cleanPhone.substring(1)}`;
    }
    
    if (cleanPhone.startsWith('5') && cleanPhone.length === 9) {
      return `972${cleanPhone}`;
    }
    
    if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
      return cleanPhone;
    }
    
    if (cleanPhone.startsWith('+')) {
      return cleanPhone.substring(1);
    }
    
    return cleanPhone;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
