import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CheckSquare, 
  Copy, 
  Menu, 
  X, 
  Plus,
  Trash2,
  Check,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePersonalTasksStore } from '@/store/usePersonalTasksStore';
import { PersonalTask, Priority } from '@/types';
import { useToast } from '@/hooks/use-toast';

// ✅ FIXED: הוסף פונקציה חסרה
const getPriorityIcon = (priority: Priority) => {
  switch (priority) {
    case 'גבוהה':
      return <ArrowUp className="w-3 h-3 text-red-500" />;
    case 'בינונית':
      return <ArrowRight className="w-3 h-3 text-yellow-500" />;
    case 'נמוכה':
      return <ArrowDown className="w-3 h-3 text-green-500" />;
    default:
      return <ArrowRight className="w-3 h-3 text-gray-400" />;
  }
};

export function TasksSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('בינונית');
  const { 
    tasks, 
    addTask, 
    toggleTask, 
    deleteTask, 
    updateTask,
    clearCompleted 
  } = usePersonalTasksStore();
  const { toast } = useToast();

  // משימות לא מושלמות, ממויינות לפי עדיפות
  const pendingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => {
      const priorityOrder = { 'גבוהה': 3, 'בינונית': 2, 'נמוכה': 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const completedTasks = tasks.filter(task => task.completed);

  // הוספת משימה חדשה
  const handleAddTask = () => {
    if (!newTask.trim()) return;
    
    addTask(newTask, newTaskPriority);
    setNewTask('');
    setNewTaskPriority('בינונית');
    
    toast({
      title: "משימה נוספה!",
      description: `המשימה "${newTask}" נוספה בהצלחה`,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTask();
    }
  };

  // העתקת משימות שלא בוצעו
  const handleCopyPendingTasks = async () => {
    if (pendingTasks.length === 0) {
      toast({
        title: "אין משימות",
        description: "אין משימות להעתקה",
        variant: "destructive"
      });
      return;
    }

    const tasksList = pendingTasks.map(task => 
      `• ${task.title} (${task.priority})`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(tasksList);
      toast({
        title: "הועתק בהצלחה!",
        description: `${pendingTasks.length} משימות הועתקו ללוח`,
      });
    } catch (error) {
      console.error('Failed to copy tasks:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להעתיק את המשימות",
        variant: "destructive"
      });
    }
  };

  // ניקוי משימות מושלמות
  const handleClearCompleted = () => {
    if (completedTasks.length === 0) return;
    
    clearCompleted();
    toast({
      title: "נוקה בהצלחה!",
      description: `${completedTasks.length} משימות מושלמות נמחקו`,
    });
  };

  const handleTaskToggle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    toggleTask(taskId);
    
    if (!task.completed) {
      toast({
        title: "כל הכבוד! ✅",
        description: `המשימה "${task.title}" הושלמה`,
      });
    }
  };

  const handleTaskDelete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    deleteTask(taskId);
    toast({
      title: "משימה נמחקה",
      description: `המשימה "${task.title}" נמחקה בהצלחה`,
    });
  };

  const handlePriorityChange = (taskId: string, newPriority: Priority) => {
    updateTask(taskId, { priority: newPriority });
    toast({
      title: "עדיפות עודכנה",
      description: `העדיפות עודכנה ל${newPriority}`,
    });
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <h2 className="font-semibold text-gray-800">משימות אישיות</h2>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-white/50 rounded-md transition-colors"
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
        
        {!isCollapsed && (
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>{pendingTasks.length} פתוחות</span>
            {completedTasks.length > 0 && (
              <span>{completedTasks.length} הושלמו</span>
            )}
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* הוספת משימה */}
          <div className="p-4 flex-shrink-0 space-y-3">
            <div className="flex gap-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="הוסף משימה חדשה..."
                className="flex-1"
              />
              <Button
                onClick={handleAddTask}
                size="sm"
                disabled={!newTask.trim()}
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* בחירת עדיפות */}
            <div className="flex gap-1">
              {(['גבוהה', 'בינונית', 'נמוכה'] as Priority[]).map((priority) => (
                <Button
                  key={priority}
                  variant={newTaskPriority === priority ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewTaskPriority(priority)}
                  className="flex-1 gap-1 text-xs"
                >
                  {getPriorityIcon(priority)}
                  {priority}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* כפתורי פעולה */}
          <div className="p-4 flex-shrink-0 space-y-2">
            <Button
              onClick={handleCopyPendingTasks}
              variant="outline"
              size="sm"
              className="w-full gap-2"
              disabled={pendingTasks.length === 0}
            >
              <Copy className="w-4 h-4" />
              העתק משימות פתוחות
            </Button>
            
            {completedTasks.length > 0 && (
              <Button
                onClick={handleClearCompleted}
                variant="outline"
                size="sm"
                className="w-full gap-2"
              >
                <Trash2 className="w-4 h-4" />
                נקה הושלמו ({completedTasks.length})
              </Button>
            )}
          </div>

          <Separator />

          {/* רשימת משימות */}
          <ScrollArea className="flex-1 p-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground font-medium">אין משימות עדיין</p>
                <p className="text-sm text-muted-foreground mt-1">התחל להוסיף משימות אישיות</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* משימות פתוחות */}
                {pendingTasks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">משימות פתוחות</h3>
                    {pendingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleTaskToggle(task.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 break-words">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-xs",
                                task.priority === 'גבוהה' && "border-red-200 text-red-700 bg-red-50",
                                task.priority === 'בינונית' && "border-yellow-200 text-yellow-700 bg-yellow-50",
                                task.priority === 'נמוכה' && "border-green-200 text-green-700 bg-green-50"
                              )}
                            >
                              {getPriorityIcon(task.priority)}
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handlePriorityChange(task.id, 'גבוהה')}>
                                <ArrowUp className="w-3 h-3 mr-2 text-red-500" />
                                עדיפות גבוהה
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePriorityChange(task.id, 'בינונית')}>
                                <ArrowRight className="w-3 h-3 mr-2 text-yellow-500" />
                                עדיפות בינונית
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handlePriorityChange(task.id, 'נמוכה')}>
                                <ArrowDown className="w-3 h-3 mr-2 text-green-500" />
                                עדיפות נמוכה
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleTaskDelete(task.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-3 h-3 mr-2" />
                                מחק משימה
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* משימות מושלמות */}
                {completedTasks.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">הושלמו</h3>
                    {completedTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-start gap-3 p-3 bg-gray-50 border border-gray-100 rounded-lg opacity-75"
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => handleTaskToggle(task.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-600 line-through break-words">
                            {task.title}
                          </p>
                          {task.completedAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              הושלמה ב-{new Date(task.completedAt).toLocaleDateString('he-IL')}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTaskDelete(task.id)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </div>
  );
}
