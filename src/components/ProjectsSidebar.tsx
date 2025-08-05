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
        'fixed right-0 top-0 h-screen z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md transition-all duration-300 shadow-xl flex flex-col border-l border-gray-200/50 dark:border-gray-700/50',
        isCollapsed ? 'w-12' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200/30 dark:border-gray-700/30 flex-shrink-0 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-800/50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FolderOpen className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  פרויקטים
                </h2>
                <p className="text-xs text-muted-foreground">
                  {projects.length} פרויקטים
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
          >
            {isCollapsed ? (
              <Menu size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <X size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* רשימת פרויקטים */}
          <ScrollArea className="flex-1 p-4">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-3">
                  <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">אין פרויקטים</p>
                <p className="text-xs text-muted-foreground/70 mt-1">צור פרויקט ראשון</p>
              </div>
            ) : (
              <div className="space-y-2">
                {projects.map((project, index) => {
                  const stats = getProjectStats(project);
                  return (
                    <div
                      key={project.id}
                      onClick={() => highlightProject(project.id)}
                      className="group p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                          {project.name}
                        </h3>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 ml-2 group-hover:scale-110" />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <div className={cn("w-2 h-2 rounded-full", 
                            project.status === 'פעיל' ? 'bg-green-500' :
                            project.status === 'תכנון' ? 'bg-blue-500' :
                            project.status === 'הושלם' ? 'bg-gray-500' : 'bg-yellow-500'
                          )}></div>
                          <span className="text-muted-foreground">{project.status}</span>
                        </div>
                        
                        <div className="text-muted-foreground">
                          {stats.completed}/{stats.total}
                        </div>
                      </div>
                      
                      {stats.total > 0 && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <div
                              className="bg-primary h-1 rounded-full transition-all duration-300"
                              style={{ width: `${stats.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </>
      )}

      {/* במצב מוקטן - מספר פרויקטים */}
      {isCollapsed && projects.length > 0 && (
        <div className="p-3">
          <div className="relative">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-xs font-bold mx-auto shadow-sm">
              {projects.length}
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}