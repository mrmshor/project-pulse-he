import { useState, useEffect } from 'react';
import { isTauriEnvironment } from '@/lib/tauri';
import { useProjectStore } from '@/store/useProjectStore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export function TauriStatus() {
  const [isTauri, setIsTauri] = useState(false);
  const { saveToNative, loadFromNative } = useProjectStore();

  useEffect(() => {
    setIsTauri(isTauriEnvironment());
    
    // טען נתונים מהאחסון הנייטיבי בהפעלה
    if (isTauriEnvironment()) {
      loadFromNative();
    }
  }, [loadFromNative]);

  const handleSaveNative = async () => {
    const success = await saveToNative();
    if (success) {
      alert('הנתונים נשמרו בהצלחה באחסון הנייטיבי!');
    } else {
      alert('שגיאה בשמירת הנתונים');
    }
  };

  if (!isTauri) return null;

  return (
    <div className="fixed top-4 left-4 flex items-center gap-2 z-50">
      <Badge variant="secondary" className="bg-primary text-primary-foreground">
        🖥️ מצב דסקטופ
      </Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSaveNative}
        className="gap-1"
      >
        <Save size={14} />
        שמור נייטיבי
      </Button>
    </div>
  );
}