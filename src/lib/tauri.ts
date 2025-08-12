import { invoke } from '@tauri-apps/api/core';
import { writeTextFile, readTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';
import { open as openDialog } from '@tauri-apps/plugin-dialog';

// ✅ פתיחת תיקיות במחשב
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

// ✅ פתיחת WhatsApp במחשב
export async function openWhatsApp(phoneNumber: string, message?: string): Promise<boolean> {
  try {
    if (!isTauriEnvironment()) {
      // Fallback לדפדפן
      const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
      const url = message 
        ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
        : `https://wa.me/${formattedPhone}`;
      window.open(url, '_blank');
      return true;
    }

    console.log('💬 Opening WhatsApp for:', phoneNumber);
    
    // שימוש בפונקציה הנייטיבית של Rust
    await invoke('open_whatsapp', { 
      phone: formatPhoneForWhatsApp(phoneNumber), 
      message: message || null 
    });
    
    console.log('✅ WhatsApp opened successfully');
    return true;
  } catch (error) {
    console.error('❌ Error opening WhatsApp:', error);
    return false;
  }
}

// ✅ פתיחת אימייל במחשב
export async function openMail(email: string, subject?: string, body?: string): Promise<boolean> {
  try {
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
    return false;
  }
}

export async function openPhone(phone: string) {
  try {
    const phoneUrl = `tel:${phone}`;
    if (!isTauriEnvironment()) {
      window.open(phoneUrl, '_blank');
      return;
    }

    await invoke('open_url', { url: phoneUrl });
    console.log('Phone dialer opened for:', phone);
  } catch (error) {
    console.error('Error opening phone dialer:', error);
  }
}

export async function saveDataNative(data: any) {
  try {
    if (!isTauriEnvironment()) {
      console.log('Browser mode: Using localStorage');
      localStorage.setItem('projectData', JSON.stringify(data));
      return true;
    }

    const appDir = await appDataDir();
    const dataPath = `${appDir}/ProjectManager`;
    
    const dirExists = await exists(dataPath);
    if (!dirExists) {
      await mkdir(dataPath, { recursive: true });
    }
    
    await writeTextFile(`${dataPath}/data.json`, JSON.stringify(data, null, 2));
    console.log('Data saved to native storage');
    return true;
  } catch (error) {
    console.error('Error saving data natively:', error);
    return false;
  }
}

export async function loadDataNative() {
  try {
    if (!isTauriEnvironment()) {
      console.log('Browser mode: Using localStorage');
      const data = localStorage.getItem('projectData');
      return data ? JSON.parse(data) : null;
    }

    const appDir = await appDataDir();
    const dataPath = `${appDir}/ProjectManager/data.json`;
    
    const fileExists = await exists(dataPath);
    if (!fileExists) {
      return null;
    }
    
    const content = await readTextFile(dataPath);
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading data natively:', error);
    return null;
  }
}

export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

export async function exportFileNative(content: string, filename: string, format: 'json' | 'csv' | 'xlsx') {
  try {
    if (!isTauriEnvironment()) {
      // Fallback לדפדפן
      const blob = new Blob([content], { type: 'text/plain' });
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
    
    if (savePath) {
      await writeTextFile(savePath as string, content);
      console.log(`File saved: ${savePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error exporting file:', error);
    return false;
  }
}

// Helper function
function formatPhoneForWhatsApp(phoneNumber: string): string {
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
