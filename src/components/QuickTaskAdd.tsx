import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Check, X } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';

interface QuickTaskAddProps {
  projectId: string;
  onTaskAdded?: () => void;
}

export function QuickTaskAdd({ projectId, onTaskAdded }: QuickTaskAddProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const { addTask } = useProjectStore();

  const handleAddTask = () => {
    if (!taskTitle.trim()) return;

    const newTask = {
      title: taskTitle.trim(),
      projectId,
      status: 'לביצוע' as const,
      priority: 'בינונית' as const,
      dueDate: new Date(),
      order: Date.now(), // משתמש בזמן נוכחי כדי שמשימות חדשות יהיו עם order גבוה יותר
      tags: []
    };

    addTask(newTask);
    setTaskTitle(''); // רק מאפס את השדה, לא סוגר
    onTaskAdded?.();
  };

  const handleCancel = () => {
    setTaskTitle('');
    setIsAdding(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
      // השדה נשאר פתוח למשימה הבאה
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isAdding) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsAdding(true)}
        className="w-full justify-start gap-2 h-8 text-muted-foreground hover:text-foreground"
      >
        <Plus className="w-4 h-4" />
        הוסף משימה
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={taskTitle}
        onChange={(e) => setTaskTitle(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="הוסף משימה... (Enter להוסיף עוד)"
        className="h-8 text-sm"
        autoFocus
      />
      <Button
        size="sm"
        onClick={handleAddTask}
        disabled={!taskTitle.trim()}
        className="h-8 w-8 p-0"
      >
        <Check className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        className="h-8 w-8 p-0"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}