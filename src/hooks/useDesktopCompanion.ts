import { useState, useEffect } from 'react';
import { DesktopCompanionService } from '@/services/desktopCompanionService';

export function useDesktopCompanion() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const connected = await DesktopCompanionService.checkConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // בדיקה ראשונית
    checkConnection();

    // בדיקה תקופתית כל 30 שניות
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    isConnected,
    isChecking,
    checkConnection,
    companionInfo: DesktopCompanionService.getConnectionStatus()
  };
}