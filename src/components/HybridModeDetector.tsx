import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isTauriEnvironment } from '@/lib/tauri';
import { ClientContactService } from '@/services/nativeServices';
import { Monitor, Smartphone, Wifi, WifiOff, Settings } from 'lucide-react';

interface HybridModeDetectorProps {
  onModeChange?: (mode: 'web' | 'desktop') => void;
}

export function HybridModeDetector({ onModeChange }: HybridModeDetectorProps) {
  const [mode, setMode] = useState<'web' | 'desktop'>('web');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [tauriConnected, setTauriConnected] = useState(false);

  useEffect(() => {
    // בדיקת סביבת הרצה
    const currentMode = isTauriEnvironment() ? 'desktop' : 'web';
    setMode(currentMode);
    onModeChange?.(currentMode);

    // בדיקת חיבור Tauri
    if (currentMode === 'desktop') {
      ClientContactService.testTauriConnection()
        .then(setTauriConnected)
        .catch(() => setTauriConnected(false));
    }

    // מאזין לשינויי חיבור
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onModeChange]);

  const getModeIcon = () => {
    return mode === 'desktop' ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />;
  };

  const getModeColor = () => {
    if (mode === 'desktop') {
      return tauriConnected ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
    }
    return isOnline ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800';
  };

  const getModeText = () => {
    if (mode === 'desktop') {
      return tauriConnected ? 'אפליקציית שולחן עבודה' : 'מצב שולחן עבודה (בעיה)';
    }
    return isOnline ? 'אפליקציית ווב' : 'מצב לא מקוון';
  };

  const getCapabilities = () => {
    const capabilities = [];
    
    if (mode === 'desktop' && tauriConnected) {
      capabilities.push('פתיחת תיקיות מקומיות');
      capabilities.push('WhatsApp & אימייל נייטיבי');
      capabilities.push('שמירה מקומית');
    }
    
    if (isOnline) {
      capabilities.push('סנכרון ענן');
      capabilities.push('שיתוף נתונים');
      capabilities.push('עדכונים אוטומטיים');
    }
    
    return capabilities;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getModeIcon()}
            <CardTitle className="text-lg">מצב הפעלה</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getModeColor()}>
              {getModeText()}
            </Badge>
            {isOnline ? 
              <Wifi className="w-4 h-4 text-green-600" /> : 
              <WifiOff className="w-4 h-4 text-red-600" />
            }
          </div>
        </div>
        <CardDescription>
          {mode === 'desktop' 
            ? 'אפליקציה היברידית - פונקציות שולחן עבודה + ענן'
            : 'אפליקציית ווב - נגישה מכל מקום'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-2">יכולות זמינות:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {getCapabilities().map((capability, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{capability}</span>
                </div>
              ))}
            </div>
          </div>
          
          {mode === 'desktop' && !tauriConnected && (
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">בעיה בחיבור מקומי</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                חלק מהפונקציות המקומיות עלולות לא לפעול כראוי
              </p>
            </div>
          )}
          
          {!isOnline && (
            <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <WifiOff className="w-4 h-4" />
                <span className="text-sm font-medium">אין חיבור לאינטרנט</span>
              </div>
              <p className="text-xs text-red-700 mt-1">
                פונקציות הענן אינן זמינות
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}