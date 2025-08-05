import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckSquare, 
  Copy, 
  Menu, 
  X, 
  Clock, 
  Folder,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import { Task } from '@/types';
import { useToast } from '@/hooks/use-toast';

export function TasksSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { projects, getTasksByProject, updateTask } = useProjectStore();
  const { toast } = useToast();

  // כל המשימות מכל הפרויקטים
  const allTasks = projects.flatMap(project => 
    getTasksByProject(project.id).map(task => ({
      ...task,
      projectName: project.name,
      projectId: project.id
    }))
  );

  // משימות שלא הושלמו, ממוינות לפי עדיפות ותאריך
  const pendingTasks = allTasks
    .filter(task => task.status !== 'הושלמה')
    .sort((a, b) => {
      // עדיפות גבוהה ראשונה
      const priorityOrder = { 'גבוהה': 3, 'בינונית': 2, 'נמוכה': 1 };
      const aPriority = priorityOrder[a.priority] || 1;
      const bPriority = priorityOrder[b.priority] || 1;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // אחר כך לפי תאריך יצירה (order)
      return b.order - a.order;
    });

  // העתקת משימות שלא בוצעו ללוח
  const handleCopyPendingTasks = async () => {
    if (pendingTasks.length === 0) {
      toast({
        title: "אין משימות",
        description: "אין משימות שלא בוצעו להעתקה",
        variant: "destructive"
      });
      return;
    }

    const tasksList = pendingTasks.map(task => 
      `• ${task.title} (${task.projectName})`
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

  // סימון משימה כהושלמה
  const handleTaskToggle = (task: Task & { projectName: string }) => {
    const newStatus = task.status === 'הושלמה' ? 'לביצוע' : 'הושלמה';
    updateTask(task.id, { ...task, status: newStatus });
  };

  const urgentTasks = pendingTasks.filter(task => task.priority === 'גבוהה');
  const regularTasks = pendingTasks.filter(task => task.priority !== 'גבוהה');

  return (
    <div
      className={cn(
        'glass h-screen transition-smooth shadow-elegant flex flex-col',
        isCollapsed ? 'w-16' : 'w-80'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold gradient-primary bg-clip-text text-transparent">
                משימות מהירות
              </h1>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 btn-glass transition-smooth"
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
        
        {!isCollapsed && (
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>{pendingTasks.length} משימות פתוחות</span>
            {urgentTasks.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {urgentTasks.length} דחופות
              </Badge>
            )}
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* כפתור העתקה */}
          <div className="p-4 flex-shrink-0">
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
          </div>

          <Separator />

          {/* רשימת משימות */}
          <ScrollArea className="flex-1 p-4">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">כל המשימות בוצעו!</p>
                <p className="text-sm text-muted-foreground mt-1">כל הכבוד! 🎉</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* משימות דחופות */}
                {urgentTasks.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-medium text-red-600 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      דחופות ({urgentTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {urgentTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 border border-red-200 rounded-lg bg-red-50/50 hover:bg-red-50 transition-colors group"
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={false}
                              onCheckedChange={() => handleTaskToggle(task)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-red-900 leading-tight">
                                {task.title}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Folder className="w-3 h-3 text-red-600" />
                                <span className="text-xs text-red-600 truncate">
                                  {task.projectName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* משימות רגילות */}
                {regularTasks.length > 0 && (
                  <div>
                    {urgentTasks.length > 0 && (
                      <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                        <Clock className="w-4 h-4" />
                        רגילות ({regularTasks.length})
                      </h3>
                    )}
                    <div className="space-y-2">
                      {regularTasks.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 border rounded-lg hover:bg-accent/50 transition-colors group"
                        >
                          <div className="flex items-start gap-2">
                            <Checkbox
                              checked={false}
                              onCheckedChange={() => handleTaskToggle(task)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight">
                                {task.title}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <Folder className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground truncate">
                                  {task.projectName}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </>
      )}

      {/* במצב מוקטן - הצגת מספר משימות דחופות בלבד */}
      {isCollapsed && urgentTasks.length > 0 && (
        <div className="p-2">
          <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold mx-auto">
            {urgentTasks.length}
          </div>
        </div>
      )}
    </div>
  );
}