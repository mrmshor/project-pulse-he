import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Clock } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { TimeEntry } from '@/types';

interface TaskTimerProps {
  taskId: string;
}

export function TaskTimer({ taskId }: TaskTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentDuration, setCurrentDuration] = useState(0);
  const { addTimeEntry, getTimeEntriesByTask } = useProjectStore();

  const timeEntries = getTimeEntriesByTask(taskId);
  const totalTime = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now.getTime() - startTime.getTime()) / 60000);
        setCurrentDuration(duration);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const startTimer = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setCurrentDuration(0);
  };

  const stopTimer = () => {
    if (startTime) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);
      
      const timeEntry: Omit<TimeEntry, 'id'> = {
        taskId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: Math.max(1, duration), // מינימום דקה אחת
      };
      
      addTimeEntry(timeEntry);
      setIsRunning(false);
      setStartTime(null);
      setCurrentDuration(0);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">מעקב זמן</span>
          </div>
          
          <div className="flex items-center gap-2">
            {isRunning && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {formatTime(currentDuration)}
              </Badge>
            )}
            
            {totalTime > 0 && (
              <Badge variant="outline">
                סה"כ: {formatTime(totalTime)}
              </Badge>
            )}
            
            {!isRunning ? (
              <Button
                onClick={startTimer}
                size="sm"
                className="gap-1"
              >
                <Play size={14} />
                התחל
              </Button>
            ) : (
              <Button
                onClick={stopTimer}
                size="sm"
                variant="destructive"
                className="gap-1"
              >
                <Square size={14} />
                עצור
              </Button>
            )}
          </div>
        </div>
        
        {timeEntries.length > 0 && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground">
              רשומות זמן: {timeEntries.length}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}