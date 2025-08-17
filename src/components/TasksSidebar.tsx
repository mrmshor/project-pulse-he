import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CheckSquare, 
  Menu, 
  X, 
  Plus,
  Trash2,
  Check,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  MoreVertical,
  Timer
} from 'lucide-react';
import { usePersonalTasksStore } from '@/store/usePersonalTasksStore';
import { Priority } from '@/types';
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
      
      // FIXED: Parse ISO strings to dates for comparison
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

  // מעבר בין מושלם ולא מושלם
  const handleToggleTask = (taskId: string) => {
    toggleTask(taskId);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: task.completed ? "משימה בוטלה" : "משימה הושלמה!",
        description: `המשימה "${task.title}" ${task.completed ? 'בוטלה' : 'הושלמה'}`,
      });
    }
  };

  // מחיקת משימה
  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && confirm(`האם אתה בטוח שברצונך למחוק את המשימה "${task.title}"?`)) {
      deleteTask(taskId);
      toast({
        title: "משימה נמחקה",
        description: `המשימה "${task.title}" נמחקה`,
      });
    }
  };

  // עדכון עדיפות משימה
  const handlePriorityChange = (taskId: string, priority: Priority) => {
    updateTask(taskId, { priority });
    toast({
      title: "עדיפות עודכנה",
      description: `העדיפות שונתה ל${priority}`,
    });
  };

  if (isCollapsed) {
    return (
      <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-16 bg-white border-r shadow-lg flex flex-col items-center py-4 z-40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <Menu className="w-4 h-4" />
        </Button>
        
        <div className="flex flex-col gap-2">
          <Badge variant="secondary" className="text-xs">
            {pendingTasks.length}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-r shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">משימות אישיות</h2>
        </div>
        
        <div className="flex gap-1">
          {completedTasks.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={clearCompleted}
              title="נקה משימות מושלמות"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsCollapsed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Add New Task */}
      <div className="p-4 border-b">
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="הוסף משימה חדשה..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            className="flex-1 rtl"
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                {getPriorityIcon(newTaskPriority)}
                {newTaskPriority}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(['גבוהה', 'בינונית', 'נמוכה'] as Priority[]).map((priority) => (
                <DropdownMenuItem
                  key={priority}
                  onClick={() => setNewTaskPriority(priority)}
                  className="gap-2"
                >
                  {getPriorityIcon(priority)}
                  {priority}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button 
          onClick={handleAddTask} 
          disabled={!newTask.trim()}
          className="w-full"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          הוסף משימה
        </Button>
      </div>

      {/* Tasks List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Timer className="w-4 h-4" />
                ממתינות ({pendingTasks.length})
              </h3>
              
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-auto p-0 gap-1">
                              {getPriorityIcon(task.priority)}
                              <span className="text-xs">{task.priority}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {(['גבוהה', 'בינונית', 'נמוכה'] as Priority[]).map((priority) => (
                              <DropdownMenuItem
                                key={priority}
                                onClick={() => handlePriorityChange(task.id, priority)}
                                className="gap-2"
                              >
                                {getPriorityIcon(priority)}
                                {priority}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        
                        <span className="text-xs text-muted-foreground">
                          {new Date(task.createdAt).toLocaleDateString('he-IL')}
                        </span>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDeleteTask(task.id)}
                          className="gap-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          מחק משימה
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  הושלמו ({completedTasks.length})
                </h3>
              </div>
              
              <div className="space-y-2">
                {completedTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 opacity-75"
                  >
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleTask(task.id)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-through text-muted-foreground truncate">
                        {task.title}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        הושלמה {task.completedAt ? new Date(task.completedAt).toLocaleDateString('he-IL') : ''}
                      </span>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                
                {completedTasks.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    ועוד {completedTasks.length - 5} משימות מושלמות...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Empty State */}
          {tasks.length === 0 && (
            <div className="text-center py-12">
              <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">אין משימות עדיין</h3>
              <p className="text-sm text-muted-foreground">
                הוסף משימה ראשונה כדי להתחיל
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
