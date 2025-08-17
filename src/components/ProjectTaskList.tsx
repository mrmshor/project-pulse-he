import React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  MoreVertical,
  ListTodo
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import { Task, TaskStatus, Priority } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { PrioritySelector } from './PrioritySelector';

interface ProjectTaskListProps {
  projectId: string;
  className?: string;
}

const taskStatusConfig = {
  'ממתין': {
    label: 'ממתין',
    color: 'bg-gray-100 text-gray-700',
    icon: Clock
  },
  'בעבודה': {
    label: 'בעבודה',
    color: 'bg-blue-100 text-blue-700',
    icon: ListTodo
  },
  'הושלם': {
    label: 'הושלם',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle2
  }
} as const;

export function ProjectTaskList({ projectId, className }: ProjectTaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>('בינונית');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const { 
    getTasksByProject, 
    addTask, 
    updateTask, 
    deleteTask 
  } = useProjectStore();
  const { toast } = useToast();

  const tasks = getTasksByProject(projectId);

  // Sort tasks: incomplete first, then by priority, then by creation date
  const sortedTasks = [...tasks].sort((a, b) => {
    // Completed tasks last
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Priority (high to low)
    const priorityOrder = { 'גבוהה': 3, 'בינונית': 2, 'נמוכה': 1 };
    const aPriority = priorityOrder[a.priority] || 1;
    const bPriority = priorityOrder[b.priority] || 1;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // Creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: Omit<Task, 'id'> = {
      title: newTaskTitle,
      description: '',
      projectId,
      completed: false,
      priority: newTaskPriority,
      status: 'ממתין',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    addTask(newTask);
    setNewTaskTitle('');
    setNewTaskPriority('בינונית');
    setIsAddingTask(false);
    
    toast({
      title: "משימה נוספה",
      description: `המשימה "${newTaskTitle}" נוספה לפרויקט`,
    });
  };

  const handleToggleTask = (taskId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedTask = {
      ...task,
      completed,
      status: completed ? 'הושלם' as TaskStatus : 'ממתין' as TaskStatus,
      updatedAt: new Date().toISOString()
    };
    
    updateTask(updatedTask);
    
    toast({
      title: completed ? "משימה הושלמה" : "משימה סומנה כלא הושלמה",
      description: `המשימה "${task.title}" עודכנה`,
    });
  };

  const handleEditTask = (taskId: string, newTitle: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !newTitle.trim()) return;
    
    const updatedTask = {
      ...task,
      title: newTitle,
      updatedAt: new Date().toISOString()
    };
    
    updateTask(updatedTask);
    setEditingTaskId(null);
    setEditTitle('');
    
    toast({
      title: "משימה עודכנה",
      description: `המשימה עודכנה ל"${newTitle}"`,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    if (confirm(`האם אתה בטוח שברצונך למחוק את המשימה "${task.title}"?`)) {
      deleteTask(taskId);
      toast({
        title: "משימה נמחקה",
        description: `המשימה "${task.title}" נמחקה`,
      });
    }
  };

  const handleUpdateTaskPriority = (taskId: string, priority: Priority) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedTask = {
      ...task,
      priority,
      updatedAt: new Date().toISOString()
    };
    
    updateTask(updatedTask);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const updatedTask = {
      ...task,
      status,
      completed: status === 'הושלם',
      updatedAt: new Date().toISOString()
    };
    
    updateTask(updatedTask);
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className={cn('mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 dark:bg-blue-950/20 p-4', className)}>
      <div className="mb-2">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-blue-700">משימות</div>
          <div className="px-2 py-0.5 rounded-full bg-white text-blue-700 border border-blue-200 text-xs">{completedCount}/{tasks.length}</div>
        </div>
        {tasks.length > 0 && (
          <div className="mt-3">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-2 bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>
        )}
      </div>
      
      
        {/* Add New Task */}
        {isAddingTask && (
          <div className="mb-4 p-3 border rounded-lg bg-muted/30">
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="כותרת המשימה..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                className="flex-1"
                autoFocus
              />
              <PrioritySelector
                value={newTaskPriority}
                onChange={setNewTaskPriority}
                size="sm"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
              >
                <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> הוסף</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle('');
                  setNewTaskPriority('בינונית');
                }}
              >
                ביטול
              </Button>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-2">
          {sortedTasks.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>אין משימות עדיין</p>
              <p className="text-sm">הוסף משימה ראשונה לפרויקט</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div
                key={task.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all duration-200',
                  task.completed 
                    ? 'bg-muted/50 opacity-75' 
                    : 'bg-background hover:bg-muted/30'
                )}
              >
                {/* Checkbox */}
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) => 
                    handleToggleTask(task.id, checked as boolean)
                  }
                  className="flex-shrink-0"
                />

                {/* Task Content */}
                <div className="flex-1 min-w-0">
                  {editingTaskId === task.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleEditTask(task.id, editTitle);
                        }
                      }}
                      onBlur={() => handleEditTask(task.id, editTitle)}
                      className="h-8"
                      autoFocus
                    />
                  ) : (
                    <div
                      className={cn(
                        'font-medium cursor-pointer',
                        task.completed && 'line-through text-muted-foreground'
                      )}
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setEditTitle(task.title);
                      }}
                    >
                      {task.title}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={cn('text-xs', taskStatusConfig[task.status].color)}
                    >
                      {taskStatusConfig[task.status].label}
                    </Badge>
                    
                    <PrioritySelector
                      value={task.priority}
                      onChange={(priority) => handleUpdateTaskPriority(task.id, priority)}
                      size="sm"
                      disabled={task.completed}
                    />
                    
                    <span className="text-xs text-muted-foreground">
                      {new Date(task.createdAt).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rtl">
                    {(Object.keys(taskStatusConfig) as TaskStatus[]).map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => handleUpdateTaskStatus(task.id, status)}
                        className="gap-2"
                      >
                        {React.createElement(taskStatusConfig[status].icon, { 
                          className: "w-4 h-4" 
                        })}
                        {taskStatusConfig[status].label}
                      </DropdownMenuItem>
                    ))}
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
            ))
          )}
        </div>
      
    </div>
  );
}
