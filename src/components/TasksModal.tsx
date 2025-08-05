import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, Calendar, Flag, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Task, Project } from '@/types';
import { QuickTaskAdd } from './QuickTaskAdd';

interface TasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
}

export function TasksModal({ open, onOpenChange, project }: TasksModalProps) {
  const { getTasksByProject, updateTask, deleteTask } = useProjectStore();
  const tasks = getTasksByProject(project.id).sort((a, b) => b.order - a.order);

  const handleTaskToggle = (task: Task) => {
    const newStatus = task.status === 'הושלמה' ? 'לביצוע' : 'הושלמה';
    updateTask(task.id, { ...task, status: newStatus });
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את המשימה?')) {
      deleteTask(taskId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'הושלמה':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'בתהליך':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'גבוהה':
        return 'text-danger';
      case 'בינונית':
        return 'text-warning';
      case 'נמוכה':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const completedTasks = tasks.filter(t => t.status === 'הושלמה');
  const pendingTasks = tasks.filter(t => t.status !== 'הושלמה');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span>משימות - {project.name}</span>
              <div className="text-sm text-muted-foreground font-normal mt-1">
                {completedTasks.length}/{tasks.length} הושלמו
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-shrink-0 px-6">
          <QuickTaskAdd projectId={project.id} />
        </div>

        <Separator className="flex-shrink-0" />

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* משימות ממתינות */}
            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Circle className="w-4 h-4" />
                  ממתינות לביצוע ({pendingTasks.length})
                </h3>
                <div className="space-y-2">
                  {pendingTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <Checkbox
                        checked={false}
                        onCheckedChange={() => handleTaskToggle(task)}
                        className="mt-0.5"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <div className="flex items-center gap-1">
                            {task.priority === 'גבוהה' && (
                              <Badge variant="destructive" className="text-xs">
                                <Flag className="w-3 h-3 mr-1" />
                                דחוף
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTask(task.id)}
                              className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(task.status)}
                          <span className="text-xs text-muted-foreground">{task.status}</span>
                          {task.dueDate && (
                            <>
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(task.dueDate).toLocaleDateString('he-IL')}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* משימות שהושלמו */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  הושלמו ({completedTasks.length})
                </h3>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <Checkbox
                        checked={true}
                        onCheckedChange={() => handleTaskToggle(task)}
                        className="mt-0.5"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm line-through text-muted-foreground">
                            {task.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(task.status)}
                          <span className="text-xs text-muted-foreground">{task.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tasks.length === 0 && (
              <div className="text-center py-12">
                <Circle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">אין משימות עדיין</p>
                <p className="text-sm text-muted-foreground">הוסף משימה ראשונה למעלה</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}