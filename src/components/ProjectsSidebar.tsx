import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  FolderOpen, 
  Menu, 
  X, 
  Search,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import { Project, ProjectStatus, Priority } from '@/types';

export function ProjectsSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { projects, getTasksByProject } = useProjectStore();

  // פילטור פרויקטים לפי חיפוש
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.client?.name && project.client.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // גלילה לפרויקט ספציפי
  const scrollToProject = (projectId: string) => {
    const element = document.getElementById(`project-${projectId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest' 
      });
      
      // הדגשה זמנית
      element.classList.add('ring-2', 'ring-primary', 'ring-opacity-75');
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-primary', 'ring-opacity-75');
      }, 2000);
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'תכנון': return 'bg-gray-100 text-gray-700';
      case 'פעיל': return 'bg-blue-100 text-blue-700';
      case 'הושלם': return 'bg-green-100 text-green-700';
      case 'בהמתנה': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'גבוהה': return 'text-red-600';
      case 'בינונית': return 'text-yellow-600';
      case 'נמוכה': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // סטטיסטיקות פרויקט
  const getProjectStats = (project: Project) => {
    const tasks = getTasksByProject(project.id);
    const completedTasks = tasks.filter(task => task.status === 'הושלמה');
    return {
      total: tasks.length,
      completed: completedTasks.length,
      progress: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
    };
  };

  // פונקציה לגלילה והבהוב
  const highlightProject = (projectId: string) => {
    const element = document.getElementById(`project-${projectId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest' 
      });
      
      // הבהוב - הוספה והסרה של אפקט זוהר
      element.classList.add('animate-pulse', 'ring-2', 'ring-primary', 'ring-opacity-75');
      setTimeout(() => {
        element.classList.remove('animate-pulse', 'ring-2', 'ring-primary', 'ring-opacity-75');
      }, 2000);
    }
  };

  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-screen z-40 glass transition-smooth shadow-elegant flex flex-col border-l',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold gradient-primary bg-clip-text text-transparent">
                פרויקטים
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
          <div className="mt-3 text-sm text-muted-foreground">
            {projects.length} פרויקטים
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* רשימת פרויקטים */}
          <ScrollArea className="flex-1 px-4 pb-4">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">אין פרויקטים עדיין</p>
              </div>
            ) : (
              <div className="space-y-2 pt-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => highlightProject(project.id)}
                    className="p-3 rounded-lg hover:bg-accent/50 transition-all cursor-pointer group hover:shadow-sm border border-transparent hover:border-primary/20"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                        {project.name}
                      </h3>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </>
      )}

      {/* במצב מוקטן - מספר פרויקטים */}
      {isCollapsed && projects.length > 0 && (
        <div className="p-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mx-auto">
            {projects.length}
          </div>
        </div>
      )}
    </div>
  );
}