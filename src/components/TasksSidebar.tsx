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

  // משימות לא מושלמות, ממוינות לפי עדיפות
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
      `• ${task.title}`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(tasksList);
      toast({
        title: "הועתק בהצלחה!",
        description: `${pendingTasks.length} משימות הועתקו ללוח`,
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן להעתיק ללוח",
        variant: "destructive"
      });
    }
  };

  // ניקוי משימות מושלמות
  const handleClearCompleted = () => {
    if (completedTasks.length === 0) return;
    
    clearCompleted();
    toast({
      title: "נוקו משימות",
      description: `${completedTasks.length} משימות מושלמות הוסרו`,
    });
  };

  // שינוי עדיפות משימה
  const handlePriorityChange = (taskId: string, priority: Priority) => {
    updateTask(taskId, { priority });
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'גבוהה': return <ArrowUp className="w-3 h-3 text-red-500" />;
      case 'בינונית': return <ArrowRight className="w-3 h-3 text-yellow-500" />;
      case 'נמוכה': return <ArrowDown className="w-3 h-3 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'גבוהה': return 'border-red-200 bg-red-50';
      case 'בינונית': return 'border-yellow-200 bg-yellow-50';
      case 'נמוכה': return 'border-green-200 bg-green-50';
    }
  };

  return (
    <div
      className={cn(
        'h-full bg-white dark:bg-gray-900 transition-all duration-300 shadow-lg flex flex-col border-gray-200 dark:border-gray-700',
        isCollapsed ? 'w-16' : 'w-full'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="relative p-2 bg-gradient-to-br from-primary/20 to-green-500/20 rounded-xl shadow-sm">
                <CheckSquare className="w-5 h-5 text-primary" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl animate-pulse"></div>
              </div>
              <div>
                <div className="relative">
                  <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    משימות אישיות
                  </h2>
                  <div className="absolute -bottom-0.5 right-0 w-12 h-0.5 bg-gradient-to-l from-primary/60 to-transparent rounded-full"></div>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
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
                <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">אין משימות עדיין</p>
                <p className="text-sm text-muted-foreground mt-1">הוסף משימה ראשונה למעלה</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* משימות פתוחות */}
                {pendingTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-2">
                      פתוחות ({pendingTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {pendingTasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "p-3 border rounded-lg hover:shadow-sm transition-all group",
                            getPriorityColor(task.priority)
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={false}
                              onCheckedChange={() => toggleTask(task.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1 mb-1">
                                {getPriorityIcon(task.priority)}
                                <p className="text-sm font-medium leading-tight">
                                  {task.title}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {/* תפריט עדיפות */}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                  >
                                    <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-32">
                                  <DropdownMenuItem 
                                    onClick={() => handlePriorityChange(task.id, 'גבוהה')}
                                    className="gap-2"
                                  >
                                    <ArrowUp className="w-3 h-3 text-red-500" />
                                    גבוהה
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handlePriorityChange(task.id, 'בינונית')}
                                    className="gap-2"
                                  >
                                    <ArrowRight className="w-3 h-3 text-yellow-500" />
                                    בינונית
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handlePriorityChange(task.id, 'נמוכה')}
                                    className="gap-2"
                                  >
                                    <ArrowDown className="w-3 h-3 text-green-500" />
                                    נמוכה
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              
                              {/* כפתור מחיקה */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* משימות מושלמות */}
                {completedTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      הושלמו ({completedTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {completedTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="p-3 border rounded-lg bg-muted/30 group"
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={true}
                              onCheckedChange={() => toggleTask(task.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm line-through text-muted-foreground leading-tight">
                                {task.title}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {completedTasks.length > 5 && (
                        <p className="text-xs text-center text-muted-foreground">
                          ועוד {completedTasks.length - 5} משימות...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </>
      )}

      {/* במצב מוקטן - מספר משימות פתוחות */}
      {isCollapsed && pendingTasks.length > 0 && (
        <div className="p-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mx-auto">
            {pendingTasks.length}
          </div>
        </div>
      )}
    </div>
  );
}