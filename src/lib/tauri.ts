import { invoke } from '@tauri-apps/api/tauri';
import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/api/fs';

export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
}

export async function exportFileNative(content: string, filename: string, format: 'csv' | 'json'): Promise<void> {
  try {
    console.log('💾 Saving file to Downloads:', filename);
    
    await writeTextFile(filename, content, { dir: BaseDirectory.Download });
    console.log('✅ File saved successfully to Downloads:', filename);
  } catch (error) {
    console.error('❌ Error saving file to Downloads, using browser fallback:', error);
    
    // Fallback to browser download
    const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export async function saveData(data: any): Promise<boolean> {
  try {
    console.log('💾 Saving data to AppData...');
    
    const jsonData = JSON.stringify(data, null, 2);
    await writeTextFile('project-data.json', jsonData, { dir: BaseDirectory.AppData });
    
    console.log('✅ Data saved successfully to AppData');
    return true;
  } catch (error) {
    console.error('❌ Error saving data to AppData:', error);
    return false;
  }
}

export async function loadData(): Promise<any> {
  try {
    console.log('📁 Loading data from AppData...');
    
    const content = await readTextFile('project-data.json', { dir: BaseDirectory.AppData });
    const data = JSON.parse(content);
    
    console.log('✅ Data loaded successfully from AppData');
    return data;
  } catch (error) {
    console.error('⚠️ Error loading data from AppData (probably first time):', error);
    return null;
  }
}

// Additional utility functions for v1
export async function checkTauriCapabilities(): Promise<void> {
  if (!isTauriEnvironment()) {
    console.log('🌐 Running in browser mode');
    return;
  }

  console.log('🖥️ Running in Tauri desktop mode');
  
  try {
    // Test basic capabilities
    console.log('🔍 Testing Tauri capabilities...');
    
    // Test if we can access directories
    const { exists } = await import('@tauri-apps/api/fs');
    const appDataExists = await exists('', { dir: BaseDirectory.AppData });
    console.log('📁 AppData access:', appDataExists ? '✅' : '❌');
    
    // Test shell capabilities
    const { open } = await import('@tauri-apps/api/shell');
    console.log('🐚 Shell API loaded successfully');
    
    console.log('✅ All Tauri capabilities available');
  } catch (error) {
    console.error('❌ Error testing Tauri capabilities:', error);
  }
}
