import { open } from '@tauri-apps/plugin-dialog';
import { Command } from '@tauri-apps/plugin-shell';
import { writeTextFile, readTextFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

// פונקציות נייטיביות לבחירת תיקיות
export async function selectFolder() {
  try {
    const folderPath = await open({
      directory: true,
      title: 'בחר תיקיית פרויקט'
    });
    return folderPath;
  } catch (error) {
    console.error('Error selecting folder:', error);
    return null;
  }
}

// פונקציות נייטיביות לאנשי קשר
export async function openWhatsApp(phone: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const israeliPhone = cleanPhone.startsWith('0') 
      ? `972${cleanPhone.substring(1)}` 
      : cleanPhone;
    
    await Command.create('open', [`whatsapp://send?phone=${israeliPhone}`]).execute();
  } catch (error) {
    console.error('Error opening WhatsApp:', error);
    // Fallback to web WhatsApp
    window.open(`https://wa.me/${phone.replace(/\D/g, '').replace(/^0/, '972')}`);
  }
}

export async function openMail(email: string) {
  try {
    await Command.create('open', [`mailto:${email}`]).execute();
  } catch (error) {
    console.error('Error opening mail:', error);
    // Fallback to web mail
    window.open(`mailto:${email}`);
  }
}

export async function openPhone(phone: string) {
  try {
    await Command.create('open', [`tel:${phone}`]).execute();
  } catch (error) {
    console.error('Error opening phone:', error);
    // Fallback to web tel
    window.open(`tel:${phone}`);
  }
}

// פונקציות שמירה נייטיבית
export async function saveDataNative(data: any) {
  try {
    const appDir = await appDataDir();
    const dataPath = `${appDir}/ProjectManager`;
    
    // יצירת תיקיה אם לא קיימת
    const dirExists = await exists(dataPath);
    if (!dirExists) {
      await mkdir(dataPath, { recursive: true });
    }
    
    // שמירת הנתונים
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

// בדיקה האם רצים בסביבת Tauri
export function isTauriEnvironment() {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

// ייצוא קבצים נייטיבי
export async function exportFileNative(content: string, filename: string, format: 'json' | 'csv') {
  try {
    const savePath = await open({
      directory: false,
      multiple: false,
      title: `שמור ${format.toUpperCase()}`,
      defaultPath: filename,
      filters: [{
        name: format.toUpperCase(),
        extensions: [format]
      }]
    });

    if (savePath) {
      await writeTextFile(savePath as string, content);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error exporting file:', error);
    return false;
  }
}