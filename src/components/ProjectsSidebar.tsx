import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  FolderOpen, 
  Menu, 
  X, 
  Search,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import { Project, ProjectStatus, Priority } from '@/types';

export function ProjectsSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const { projects, getTasksByProject } = useProjectStore();

  // פילטור פרויקטים לפי חיפוש ודחיפות
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.client?.name && project.client.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

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

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'גבוהה': return <ArrowUp className="w-3 h-3" />;
      case 'בינונית': return <ArrowRight className="w-3 h-3" />;
      case 'נמוכה': return <ArrowDown className="w-3 h-3" />;
      default: return <ArrowRight className="w-3 h-3" />;
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
              <div className="relative p-2 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-xl shadow-sm">
                <FolderOpen className="w-4 h-4 text-primary" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-xl animate-pulse"></div>
              </div>
              <div>
                <div className="relative">
                  <h2 className="text-sm font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                    פרויקטים
                  </h2>
                  <div className="absolute -bottom-0.5 right-0 w-8 h-0.5 bg-gradient-to-l from-primary/60 to-transparent rounded-full"></div>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
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
          {/* חיפוש וסינון */}
          <div className="p-4 space-y-3 border-b border-gray-200/30 dark:border-gray-700/30">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                placeholder="חיפוש..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 h-8 text-xs bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-between h-8 text-xs">
                  <div className="flex items-center gap-2">
                    <Filter size={14} />
                    <span>{priorityFilter === 'all' ? 'כל הדחיפויות' : priorityFilter}</span>
                  </div>
                  {priorityFilter !== 'all' && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {filteredProjects.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 z-50">
                <DropdownMenuItem 
                  onClick={() => setPriorityFilter('all')}
                  className="gap-2 cursor-pointer"
                >
                  <div className="w-4 h-4"></div>
                  כל הדחיפויות
                  <Badge variant="outline" className="ml-auto text-xs">
                    {projects.length}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setPriorityFilter('גבוהה')}
                  className="gap-2 cursor-pointer"
                >
                  <ArrowUp className="w-4 h-4 text-red-600" />
                  גבוהה
                  <Badge variant="outline" className="ml-auto text-xs">
                    {projects.filter(p => p.priority === 'גבוהה').length}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setPriorityFilter('בינונית')}
                  className="gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 text-yellow-600" />
                  בינונית
                  <Badge variant="outline" className="ml-auto text-xs">
                    {projects.filter(p => p.priority === 'בינונית').length}
                  </Badge>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setPriorityFilter('נמוכה')}
                  className="gap-2 cursor-pointer"
                >
                  <ArrowDown className="w-4 h-4 text-green-600" />
                  נמוכה
                  <Badge variant="outline" className="ml-auto text-xs">
                    {projects.filter(p => p.priority === 'נמוכה').length}
                  </Badge>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* רשימת פרויקטים */}
          <ScrollArea className="flex-1 p-4">
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl mb-3">
                  <FolderOpen className="w-10 h-10 text-muted-foreground mx-auto" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {projects.length === 0 ? 'אין פרויקטים' : 'אין תוצאות'}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {projects.length === 0 ? 'צור פרויקט ראשון' : 'נסה חיפוש או סינון אחר'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredProjects.map((project, index) => {
                  const stats = getProjectStats(project);
                  return (
                    <div
                      key={project.id}
                      onClick={() => highlightProject(project.id)}
                      className="group p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={cn("p-1 rounded", getPriorityColor(project.priority))}>
                              {getPriorityIcon(project.priority)}
                            </div>
                            <h3 className="font-medium text-sm text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-1">
                              {project.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <span className={cn("font-medium", getPriorityColor(project.priority))}>
                              {project.priority}
                            </span>
                            <span className="text-muted-foreground">•</span>
                            <div className="flex items-center gap-1">
                              <div className={cn("w-2 h-2 rounded-full", 
                                project.status === 'פעיל' ? 'bg-green-500' :
                                project.status === 'תכנון' ? 'bg-blue-500' :
                                project.status === 'הושלם' ? 'bg-gray-500' : 'bg-yellow-500'
                              )}></div>
                              <span className="text-muted-foreground">{project.status}</span>
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0 ml-2 group-hover:scale-110" />
                      </div>
                      
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="text-muted-foreground">
                          משימות: {stats.completed}/{stats.total}
                        </div>
                        <div className="text-muted-foreground">
                          {stats.progress}%
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