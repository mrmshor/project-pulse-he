import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Task } from '@/types';
import { QuickTaskAdd } from './QuickTaskAdd';
import { TasksModal } from './TasksModal';

interface ProjectTaskListProps {
  projectId: string;
  project: any;
  maxVisible?: number;
}

export function ProjectTaskList({ projectId, project, maxVisible = 3 }: ProjectTaskListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { getTasksByProject, updateTask } = useProjectStore();
  
  const allTasks = getTasksByProject(projectId).sort((a, b) => b.order - a.order);
  const pendingTasks = allTasks.filter(task => task.status !== 'הושלמה');
  const completedTasks = allTasks.filter(task => task.status === 'הושלמה');
  
  // להציג תמיד משימות שלא הושלמו, ואם אין - אז משימות שהושלמו
  const tasksToShow = pendingTasks.length > 0 ? pendingTasks : completedTasks;
  const visibleTasks = isExpanded ? tasksToShow : tasksToShow.slice(0, maxVisible);
  const hasMoreTasks = tasksToShow.length > maxVisible;

  const handleTaskToggle = (task: Task) => {
    const newStatus = task.status === 'הושלמה' ? 'לביצוע' : 'הושלמה';
    updateTask(task.id, { ...task, status: newStatus });
  };

  const getTaskIcon = (task: Task) => {
    return task.status === 'הושלמה';
  };

  if (allTasks.length === 0) {
    return (
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground justify-start"
        >
          משימות:
        </Button>
        <QuickTaskAdd projectId={projectId} />
        <TasksModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          project={project}
          scrollToFirstPending={true}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          משימות ({completedTasks.length}/{allTasks.length})
          <ExternalLink className="w-3 h-3" />
        </Button>
        {hasMoreTasks && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </Button>
        )}
      </div>
      
      <div className="space-y-1">
        {visibleTasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 group hover:bg-accent/50 rounded p-1 transition-colors"
          >
            <Checkbox
              checked={getTaskIcon(task)}
              onCheckedChange={() => handleTaskToggle(task)}
              className="h-4 w-4"
            />
            <span 
              className={`text-xs flex-1 ${
                task.status === 'הושלמה' 
                  ? 'line-through text-muted-foreground' 
                  : 'text-foreground'
              }`}
            >
              {task.title}
            </span>
            {task.status !== 'הושלמה' && task.priority === 'גבוהה' && (
              <Badge variant="destructive" className="h-4 text-xs px-1">
                דחוף
              </Badge>
            )}
          </div>
        ))}
        
        {isExpanded && hasMoreTasks && tasksToShow.length > maxVisible && (
          <div className="text-xs text-muted-foreground text-center py-1">
            {tasksToShow.length - maxVisible} משימות נוספות
          </div>
        )}
      </div>
      
      <QuickTaskAdd projectId={projectId} />
      
      <TasksModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        project={project}
        scrollToFirstPending={true}
      />
    </div>
  );
}