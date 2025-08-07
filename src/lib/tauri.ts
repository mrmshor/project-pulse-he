import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { Command } from '@tauri-apps/plugin-shell';
import { writeTextFile, readTextFile, mkdir, exists } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

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

export async function openWhatsApp(phone: string) {
  try {
    const cleanPhone = phone.replace(/\D/g, '');
    const israeliPhone = cleanPhone.startsWith('0') 
      ? `972${cleanPhone.substring(1)}` 
      : cleanPhone;
    
    // First attempt - Desktop WhatsApp
    const whatsappUrl = `whatsapp://send?phone=${israeliPhone}`;
    
    try {
      await openUrlOrPath(whatsappUrl);
      console.log('WhatsApp opened successfully:', israeliPhone);
    } catch (desktopError) {
      console.log('Desktop WhatsApp failed, trying web version...');
      
      // Fallback to web WhatsApp
      const webUrl = `https://wa.me/${phone.replace(/\D/g, '').replace(/^0/, '972')}`;
      await openUrlOrPath(webUrl);
      console.log('WhatsApp Web opened:', webUrl);
    }
  } catch (error) {
    console.error('WhatsApp failed completely:', error);
  }
}

export async function openMail(email: string) {
  try {
    const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${email}`;
    
    try {
      await openUrlOrPath(gmailUrl);
      console.log('Gmail opened for:', email);
    } catch (gmailError) {
      console.error('Gmail failed, trying mailto:', gmailError);
      
      await openUrlOrPath(`mailto:${email}`);
      console.log('Mailto opened for:', email);
    }
  } catch (error) {
    console.error('Email opening failed completely:', error);
  }
}

export async function openPhone(phone: string) {
  try {
    await openUrlOrPath(`tel:${phone}`);
    console.log('Phone dialer opened for:', phone);
  } catch (error) {
    console.error('Error opening phone dialer:', error);
  }
}

export async function saveDataNative(data: any) {
  try {
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

export function isTauriEnvironment() {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

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
