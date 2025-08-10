import { open } from '@tauri-apps/api/dialog';
import { open as openShell } from '@tauri-apps/api/shell';

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

export class FolderService {
  static async selectProjectFolder(): Promise<string | null> {
    try {
      console.log('📁 Opening folder dialog...');
      
      const folderPath = await open({
        directory: true,
        multiple: false,
        title: 'Select Project Folder'
      });
      
      console.log('📁 Selected folder:', folderPath);
      
      if (folderPath && typeof folderPath === 'string') {
        // Auto-open the selected folder
        await this.openInFinder(folderPath);
        return folderPath;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error selecting folder:', error);
      return null;
    }
  }

  static async openInFinder(folderPath: string): Promise<boolean> {
    try {
      console.log('🗂️ Opening folder in system:', folderPath);
      
      // Use shell open which works cross-platform in v1
      await openUrlOrPath(folderPath);
      
      console.log('✅ Folder opened successfully:', folderPath);
      return true;
    } catch (error) {
      console.error('❌ Cannot open folder path:', error);
      return false;
    }
  }

  static async validateFolderPath(folderPath: string): Promise<boolean> {
    try {
      const { exists } = await import('@tauri-apps/api/fs');
      const pathExists = await exists(folderPath);
      console.log('📁 Folder exists:', pathExists, 'for path:', folderPath);
      return pathExists;
    } catch (error) {
      console.error('❌ Cannot validate folder:', error);
      return false;
    }
  }
}

export class ClientContactService {
  static async openWhatsApp(phoneNumber: string): Promise<boolean> {
    try {
      const formattedPhone = this.formatToInternational(phoneNumber);
      console.log('💬 Opening WhatsApp for:', formattedPhone);
      
      // Try WhatsApp Desktop first
      const whatsappUrl = `whatsapp://send?phone=${formattedPhone}`;
      
      try {
        await openUrlOrPath(whatsappUrl);
        console.log('✅ WhatsApp Desktop opened successfully');
        return true;
      } catch (desktopError) {
        console.log('⚠️ Desktop WhatsApp failed, trying web version...');
        
        // Fallback to WhatsApp Web
        const webUrl = `https://wa.me/${formattedPhone}`;
        await openUrlOrPath(webUrl);
        console.log('✅ WhatsApp Web opened successfully');
        return true;
      }
      
    } catch (error) {
      console.error('❌ Error opening WhatsApp:', error);
      return false;
    }
  }

  static async openGmail(email: string, subject?: string): Promise<boolean> {
    try {
      console.log('📧 Opening Gmail for:', email);
      
      const params = new URLSearchParams();
      if (subject) params.append('subject', subject);
      
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${email}&${params.toString()}`;
      
      await openUrlOrPath(gmailUrl);
      console.log('✅ Gmail opened successfully');
      return true;
    } catch (error) {
      console.error('⚠️ Gmail failed, trying mailto fallback...');
      
      // Fallback to mailto
      try {
        const mailtoUrl = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
        await openUrlOrPath(mailtoUrl);
        console.log('✅ Mailto fallback used successfully');
        return true;
      } catch (mailtoError) {
        console.error('❌ Mailto fallback failed:', mailtoError);
        return false;
      }
    }
  }

  static async dialNumber(phoneNumber: string): Promise<boolean> {
    try {
      console.log('📞 Dialing number:', phoneNumber);
      
      const telUrl = `tel:${phoneNumber}`;
      await openUrlOrPath(telUrl);
      
      console.log('✅ Phone dialer opened successfully');
      return true;
    } catch (error) {
      console.error('❌ Error dialing number:', error);
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
    
    // Already international format
    if (cleanPhone.startsWith('972')) {
      return cleanPhone;
    }
    
    // Israeli format with 0 prefix
    if (cleanPhone.startsWith('0') && cleanPhone.length >= 9) {
      return `972${cleanPhone.substring(1)}`;
    }
    
    // Israeli mobile without 0
    if (cleanPhone.startsWith('5') && cleanPhone.length === 9) {
      return `972${cleanPhone}`;
    }
    
    // US format
    if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
      return cleanPhone;
    }
    
    // Remove + if present
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
