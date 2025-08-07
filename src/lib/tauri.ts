import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { open as openUrl } from '@tauri-apps/plugin-opener';
import { writeTextFile, readTextFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

// Native functions for folder selection
export async function selectFolder() {
  try {
    const folderPath = await openDialog({
      directory: true,
      title: 'Select Project Folder'
    });
    return folderPath;
  } catch (error) {
    console.error('Error selecting folder:', error);
    return null;
  }
}

// Native contact functions - fixed for Tauri v2
export async function openWhatsApp(phone: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const israeliPhone = cleanPhone.startsWith('0') 
      ? `972${cleanPhone.substring(1)}` 
      : cleanPhone;
    
    // First attempt - Desktop WhatsApp
    const whatsappUrl = `whatsapp://send?phone=${israeliPhone}`;
    await openUrl(whatsappUrl);
    console.log('WhatsApp opened successfully:', israeliPhone);
  } catch (error) {
    console.error('WhatsApp desktop failed, trying web version:', error);
    
    // Fallback to web WhatsApp
    try {
      const webUrl = `https://wa.me/${phone.replace(/\D/g, '').replace(/^0/, '972')}`;
      await openUrl(webUrl);
      console.log('WhatsApp Web opened:', webUrl);
    } catch (webError) {
      console.error('WhatsApp Web also failed:', webError);
    }
  }
}

export async function openMail(email: string) {
  try {
    // Try Gmail first
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${email}`;
    await openUrl(gmailUrl);
    console.log('Gmail opened for:', email);
  } catch (error) {
    console.error('Gmail failed, trying mailto:', error);
    
    // Fallback to mailto
    try {
      await openUrl(`mailto:${email}`);
      console.log('Mailto opened for:', email);
    } catch (mailtoError) {
      console.error('Mailto also failed:', mailtoError);
    }
  }
}

export async function openPhone(phone: string) {
  try {
    await openUrl(`tel:${phone}`);
    console.log('Phone dialer opened for:', phone);
  } catch (error) {
    console.error('Error opening phone dialer:', error);
  }
}

// Native save functions
export async function saveDataNative(data: any) {
  try {
    const appDir = await appDataDir();
    const dataPath = `${appDir}/ProjectManager`;
    
    // Create directory if doesn't exist
    const dirExists = await exists(dataPath);
    if (!dirExists) {
      await mkdir(dataPath, { recursive: true });
    }
    
    // Save the data
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

// Check if running in Tauri environment
export function isTauriEnvironment() {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

// Native file export
export async function exportFileNative(content: string, filename: string, format: 'json' | 'csv' | 'xlsx') {
  try {
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
      if (format === 'xlsx') {
        // For xlsx need to write as binary
        const bytes = new TextEncoder().encode(content);
        await writeTextFile(savePath as string, content, { encoding: 'binary' });
      } else {
        await writeTextFile(savePath as string, content);
      }
      console.log(`File saved: ${savePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error exporting file:', error);
    return false;
  }
}
