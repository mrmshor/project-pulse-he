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
      element.classList.add('ring-4', 'ring-primary/50', 'bg-primary/10', 'scale-105');
      element.style.transition = 'all 0.3s ease-in-out';
      
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-primary/50', 'bg-primary/10', 'scale-105');
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


  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-screen z-40 bg-white dark:bg-gray-900 transition-all duration-300 shadow-lg flex flex-col border-l border-gray-200 dark:border-gray-700',
        isCollapsed ? 'w-12' : 'w-48'
      )}
    >
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                פרויקטים
              </h2>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            {isCollapsed ? <Menu size={16} /> : <X size={16} />}
          </button>
        </div>
        
        {!isCollapsed && (
          <div className="mt-2 text-xs text-muted-foreground">
            {projects.length} פרויקטים
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          {/* רשימת פרויקטים */}
          <ScrollArea className="flex-1 px-3 pb-3">
            {projects.length === 0 ? (
              <div className="text-center py-6">
                <FolderOpen className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">אין פרויקטים</p>
              </div>
            ) : (
              <div className="space-y-1 pt-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => highlightProject(project.id)}
                    className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-xs text-foreground group-hover:text-primary transition-colors truncate">
                        {project.name}
                      </h3>
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
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
          <div className="w-6 h-6 bg-primary text-primary-foreground rounded flex items-center justify-center text-xs font-bold mx-auto">
            {projects.length}
          </div>
        </div>
      )}
    </div>
  );
}