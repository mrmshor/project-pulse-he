import { invoke } from '@tauri-apps/api/core';
import { writeTextFile, readTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';
import { open as openDialog } from '@tauri-apps/plugin-dialog';

// בדיקה אם אנחנו בסביבת Tauri
export function isTauriEnvironment(): boolean {
  return false; // Forced web-only mode
}

// ✅ פונקציה מאוחדת לפורמט טלפון (במקום 3 כפילויות)
export function formatPhoneForWhatsApp(phoneNumber: string): string {
  try {
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
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return phoneNumber;
  }
}

// ✅ פתיחת WhatsApp (גישה אחידה)
export async function openWhatsApp(phoneNumber: string, message?: string): Promise<boolean> {
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

    // שימוש בפונקציה הנייטיבית של Rust
    await invoke('open_whatsapp', { 
      phone: formattedPhone
    });
    
    console.log('✅ WhatsApp opened successfully');
    return true;
  } catch (error) {
    console.error('❌ Error opening WhatsApp:', error);
    // Fallback לדפדפן במקרה של שגיאה
    const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
    const url = message 
      ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/${formattedPhone}`;
    window.open(url, '_blank');
    return true;
  }
}

// ✅ פתיחת אימייל
export async function openMail(email: string, subject?: string, body?: string): Promise<boolean> {
  try {
    let mailtoUrl = `mailto:${email}`;
    const params: string[] = [];
    
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

    console.log('📧 Opening email for:', email);
    
    // שימוש בפונקציה הנייטיבית של Rust
    await invoke('open_email', { 
      email: email,
      subject: subject || null
    });
    
    console.log('✅ Email opened successfully');
    return true;
  } catch (error) {
    console.error('❌ Error opening email:', error);
    // Fallback לדפדפן במקרה של שגיאה
    let mailtoUrl = `mailto:${email}`;
    const params: string[] = [];
    
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    
    if (params.length > 0) {
      mailtoUrl += '?' + params.join('&');
    }
    
    window.open(mailtoUrl, '_blank');
    return true;
  }
}

// ✅ פתיחת חייגן טלפון (FIXED: הפונקציה הייתה חסרה)
export async function openPhone(phone: string): Promise<boolean> {
  try {
    const phoneUrl = `tel:${phone}`;
    
    if (!isTauriEnvironment()) {
      window.open(phoneUrl, '_blank');
      return true;
    }

    await invoke('open_url', { url: phoneUrl });
    console.log('✅ Phone dialer opened for:', phone);
    return true;
  } catch (error) {
    console.error('❌ Error opening phone dialer:', error);
    // Fallback לדפדפן
    window.open(`tel:${phone}`, '_blank');
    return true;
  }
}

// ✅ פתיחת תיקיות (גישה אחידה)
export async function openFolder(folderPath: string): Promise<boolean> {
  try {
    if (!isTauriEnvironment()) {
      console.log('🌐 Browser mode: Cannot open folders');
      return false;
    }

    console.log('📁 Opening folder:', folderPath);
    
    // שימוש בפונקציה הנייטיבית של Rust
    await invoke('open_folder', { path: folderPath });
    
    console.log('✅ Folder opened successfully');
    return true;
  } catch (error) {
    console.error('❌ Error opening folder:', error);
    return false;
  }
}

// ✅ יצוא קבצים
export async function exportFileNative(content: string, filename: string, format: 'json' | 'csv' | 'xlsx'): Promise<boolean> {
  try {
    if (!isTauriEnvironment()) {
      // Fallback לדפדפן
      const mimeTypes = {
        'json': 'application/json',
        'csv': 'text/csv',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      };
      
      const blob = new Blob([content], { type: mimeTypes[format] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      return true;
    }

    const savePath = await openDialog({
      directory: false,
      multiple: false,
      title: `Save ${format.toUpperCase()}`,
      defaultPath: filename,
      filters: [{
        name: format.toUpperCase(),
        extensions: [format]
      }]
    });
    
    if (savePath && typeof savePath === 'string') {
      await writeTextFile(savePath, content);
      console.log(`✅ File saved: ${savePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Error exporting file:', error);
    return false;
  }
}

// ✅ שמירת נתונים (FIXED: הפונקציה הייתה חסרה)
export async function saveDataNative(data: any): Promise<boolean> {
  try {
    if (!isTauriEnvironment()) {
      console.log('🌐 Browser mode: Using localStorage');
      try {
        localStorage.setItem('projectData', JSON.stringify(data));
        return true;
      } catch (storageError) {
        console.error('LocalStorage error:', storageError);
        return false;
      }
    }

    const appDir = await appDataDir();
    const dataPath = `${appDir}/ProjectManager`;
    
    const dirExists = await exists(dataPath);
    if (!dirExists) {
      await mkdir(dataPath, { recursive: true });
    }
    
    await writeTextFile(`${dataPath}/data.json`, JSON.stringify(data, null, 2));
    console.log('✅ Data saved to native storage');
    return true;
  } catch (error) {
    console.error('❌ Error saving data natively:', error);
    return false;
  }
}

// ✅ טעינת נתונים (FIXED: הפונקציה הייתה חסרה)
export async function loadDataNative(): Promise<any> {
  try {
    if (!isTauriEnvironment()) {
      console.log('🌐 Browser mode: Using localStorage');
      try {
        const data = localStorage.getItem('projectData');
        return data ? JSON.parse(data) : null;
      } catch (parseError) {
        console.error('Error parsing localStorage data:', parseError);
        return null;
      }
    }

    const appDir = await appDataDir();
    const dataPath = `${appDir}/ProjectManager/data.json`;
    
    const fileExists = await exists(dataPath);
    if (!fileExists) {
      return null;
    }
    
    const content = await readTextFile(dataPath);
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing JSON file:', parseError);
      return null;
    }
  } catch (error) {
    console.error('❌ Error loading data natively:', error);
    return null;
  }
}
