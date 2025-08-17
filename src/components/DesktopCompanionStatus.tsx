import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDesktopCompanion } from '@/hooks/useDesktopCompanion';
import { isTauriEnvironment } from '@/lib/tauri';
import { 
  Monitor, 
  Globe, 
  CheckCircle, 
  XCircle, 
  Download, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export function DesktopCompanionStatus() {
  const { isConnected, isChecking, checkConnection } = useDesktopCompanion();
  const [showDetails, setShowDetails] = useState(false);

  // אם זה סביבת Tauri, לא צריך להציג את הסטטוס
  if (isTauriEnvironment()) {
    return null;
  }

  const getStatusColor = () => {
    if (isConnected) return 'bg-green-500';
    return 'bg-gray-400';
  };

  const getStatusText = () => {
    if (isConnected) return 'Desktop מחובר';
    return 'Desktop לא מחובר';
  };

  const getStatusIcon = () => {
    if (isConnected) return <CheckCircle className="w-3 h-3 text-green-600" />;
    return <XCircle className="w-3 h-3 text-gray-500" />;
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* סטטוס מקוצר */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-gray-200"
        >
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <Globe className="w-4 h-4" />
            <span className="text-xs">Web</span>
          </div>
        </Button>

        {showDetails && (
          <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-gray-200 w-80">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  Desktop Companion
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkConnection}
                  disabled={isChecking}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              <CardDescription className="text-xs">
                מאפשר פתיחת תיקיות מהדפדפן
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {/* סטטוס חיבור */}
              <div className="flex items-center justify-between">
                <span className="text-sm">סטטוס:</span>
                <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                  {getStatusIcon()}
                  {getStatusText()}
                </Badge>
              </div>

              {/* מידע טכני */}
              <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                <div>פורט: 7777</div>
                <div>URL: http://localhost:7777</div>
              </div>

              {/* הוראות התקנה */}
              {!isConnected && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Desktop Companion לא מותקן</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>כדי לפתוח תיקיות מהדפדפן:</p>
                    <ol className="list-decimal list-inside space-y-1 mr-2">
                      <li>הורד את Desktop Companion</li>
                      <li>הרץ את הקובץ</li>
                      <li>האפליקציה תרוץ ברקע</li>
                    </ol>
                  </div>

                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      // כאן נוסיף קישור להורדה בעתיד
                      alert('הורדת Desktop Companion תהיה זמינה בקרוב');
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    הורד Desktop Companion
                  </Button>
                </div>
              )}

              {/* סטטוס מחובר */}
              {isConnected && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Desktop Companion פעיל ומוכן לשימוש</span>
                </div>
              )}

              {/* כפתור סגירה */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(false)}
                className="w-full text-xs"
              >
                סגור
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}