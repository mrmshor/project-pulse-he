import { invoke } from '@tauri-apps/api/tauri';
import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import { open as openShell } from '@tauri-apps/api/shell';

export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' && window.__TAURI__ !== undefined;
}

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
    
    // Fallback לשימוש ב-shell
    try {
      await openShell(folderPath);
      return true;
    } catch (shellError) {
      console.error('❌ Shell fallback failed:', shellError);
      return false;
    }
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
    
    // Fallback ל-shell
    try {
      const formattedPhone = formatPhoneForWhatsApp(phoneNumber);
      const whatsappUrl = `whatsapp://send?phone=${formattedPhone}`;
      const webUrl = `https://wa.me/${formattedPhone}`;
      
      try {
        await openShell(whatsappUrl);
        return true;
      } catch {
        await openShell(webUrl);
        return true;
      }
    } catch (shellError) {
      console.error('❌ WhatsApp fallback failed:', shellError);
      return false;
    }
  }
}

// ✅ פתיחת אימייל במחשב - תיקון מלא
export async function openMail(email: string, subject?: string, body?: string): Promise<boolean> {
  try {
    let mailtoUrl = `mailto:${email}`;
    const params = [];
    
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    
    // ✅ תיקון: השלמת הקוד שהיה חסר
    if (params.length > 0) {
      mailtoUrl += '?' + params.join('&');
    }

    if (!isTauriEnvironment()) {
      window.open(mailtoUrl);
      return true;
    }

    console.log('📧 Opening email for:', email);
    
    // ניסיון ראשון: פונקציה נייטיבית של Rust
    try {
      await invoke('open_email', { 
        email: email, 
        subject: subject || null,
        body: body || null
      });
      console.log('✅ Email opened via Rust command');
      return true;
    } catch (rustError) {
      console.log('⚠️ Rust email command failed, trying shell fallback...', rustError);
      
      // ניסיון שני: shell fallback
      await openShell(mailtoUrl);
      console.log('✅ Email opened via shell');
      return true;
    }
  } catch (error) {
    console.error('❌ Error opening email:', error);
    return false;
  }
}

// ✅ פתיחת חיוג במחשב
export async function openPhone(phoneNumber: string): Promise<boolean> {
  try {
    const telUrl = `tel:${phoneNumber}`;

    if (!isTauriEnvironment()) {
      window.open(telUrl);
      return true;
    }

    console.log('📞 Opening phone for:', phoneNumber);
    
    // ניסיון ראשון: פונקציה נייטיבית של Rust
    try {
      await invoke('open_phone', { phone_number: phoneNumber });
      console.log('✅ Phone dialer opened via Rust command');
      return true;
    } catch (rustError) {
      console.log('⚠️ Rust phone command failed, trying shell fallback...', rustError);
      
      // ניסיון שני: shell fallback
      await openShell(telUrl);
      console.log('✅ Phone dialer opened via shell');
      return true;
    }
  } catch (error) {
    console.error('❌ Error opening phone:', error);
    return false;
  }
}

// ✅ עזר: פורמט טלפון לישראל -> WhatsApp
function formatPhoneForWhatsApp(phone: string): string {
  // הסרת כל התווים הלא-מספריים
  const digitsOnly = phone.replace(/[^\d]/g, '');
  
  // אם מתחיל ב-0, החלף ל-972 (קוד ישראל)
  if (digitsOnly.startsWith('0')) {
    return '972' + digitsOnly.substring(1);
  }
  
  // אם לא מתחיל ב-972, הוסף
  if (!digitsOnly.startsWith('972')) {
    return '972' + digitsOnly;
  }
  
  return digitsOnly;
}

// ✅ ייצוא קבצים - תיקון מלא
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
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
