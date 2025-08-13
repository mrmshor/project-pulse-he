import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Filter,
  Plus,
  User,
  Building,
  Target,
  ListTodo,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store/useProjectStore';
import { Project, ProjectStatus, Priority } from '@/types';
import { isTauriEnvironment, openFolder } from '@/lib/tauri';

export function ProjectsSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  
  const { projects, getTasksByProject } = useProjectStore();

  // Filter projects based on search and filters
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.client?.name && project.client.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort projects by priority and creation date
  const sortedProjects = filteredProjects.sort((a, b) => {
    const priorityOrder = { 'גבוהה': 3, 'בינונית': 2, 'נמוכה': 1 };
    const aPriority = priorityOrder[a.priority] || 1;
    const bPriority = priorityOrder[b.priority] || 1;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleProjectClick = (projectId: string) => {
    const element = document.getElementById(`project-${projectId}`);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest' 
      });
      
      // Highlight effect
      element.classList.add('ring-4', 'ring-primary/50', 'bg-primary/10', 'scale-105');
      element.style.transition = 'all 0.3s ease-in-out';
      
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-primary/50', 'bg-primary/10', 'scale-105');
      }, 2000);
    }
  };

  const handleOpenFolder = async (folderPath: string) => {
    if (isTauriEnvironment() && folderPath) {
      try {
        await openFolder(folderPath);
      } catch (error) {
        console.error('Error opening folder:', error);
      }
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'תכנון': return 'bg-gray-100 text-gray-700';
      case 'פעיל': return 'bg-blue-100 text-blue-700';
      case 'הושלם': return 'bg-green-100 text-green-700';
      case 'מושהה': return 'bg-yellow-100 text-yellow-700';
      case 'בוטל': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'גבוהה': return 'bg-red-100 text-red-700';
      case 'בינונית': return 'bg-yellow-100 text-yellow-700';
      case 'נמוכה': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'גבוהה': return ArrowUp;
      case 'בינונית': return ArrowRight;
      case 'נמוכה': return ArrowDown;
      default: return ArrowRight;
    }
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'תכנון': return Clock;
      case 'פעיל': return ListTodo;
      case 'הושלם': return CheckCircle2;
      case 'מושהה': return Clock;
      case 'בוטל': return X;
      default: return Clock;
    }
  };

  const getProjectProgress = (projectId: string) => {
    const tasks = getTasksByProject(projectId);
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (isCollapsed) {
    return (
      <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-16 bg-white border-l shadow-lg flex flex-col items-center py-4 z-40">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="mb-4"
        >
          <Menu className="w-4 h-4" />
        </Button>
        
        <div className="flex flex-col gap-2">
          {sortedProjects.slice(0, 5).map((project) => {
            const PriorityIcon = getPriorityIcon(project.priority);
            return (
              <Button
                key={project.id}
                variant="ghost"
                size="sm"
                onClick={() => handleProjectClick(project.id)}
                className="w-10 h-10 p-0 relative"
                title={project.name}
              >
                <PriorityIcon className="w-4 h-4" />
                {getTasksByProject(project.id).filter(t => !t.completed).length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {getTasksByProject(project.id).filter(t => !t.completed).length}
                  </div>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 bg-white border-l shadow-lg z-40 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">פרויקטים ({filteredProjects.length})</h2>
        </div>
        
        <div className="flex gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rtl">
              <div className="p-2">
                <p className="text-sm font-medium mb-2">סטטוס</p>
                <div className="space-y-1">
                  {(['all', 'תכנון', 'פעיל', 'הושלם', 'מושהה', 'בוטל'] as const).map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        'cursor-pointer',
                        statusFilter === status && 'bg-primary/10'
                      )}
                    >
                      {status === 'all' ? 'הכל' : status}
                    </DropdownMenuItem>
                  ))}
                </div>
                
                <p className="text-sm font-medium mb-2 mt-4">עדיפות</p>
                <div className="space-y-1">
                  {(['all', 'גבוהה', 'בינונית', 'נמוכה'] as const).map((priority) => (
                    <DropdownMenuItem
                      key={priority}
                      onClick={() => setPriorityFilter(priority)}
                      className={cn(
                        'cursor-pointer',
                        priorityFilter === priority && 'bg-primary/10'
                      )}
                    >
                      {priority === 'all' ? 'הכל' : priority}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsCollapsed(true)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="חפש פרויקטים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 rtl"
          />
        </div>
      </div>

      {/* Projects List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sortedProjects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>אין פרויקטים</p>
              <p className="text-sm">התחל עם פרויקט חדש</p>
            </div>
          ) : (
            sortedProjects.map((project) => {
              const StatusIcon = getStatusIcon(project.status);
              const PriorityIcon = getPriorityIcon(project.priority);
              const progress = getProjectProgress(project.id);
              const pendingTasks = getTasksByProject(project.id).filter(t => !t.completed).length;
              
              return (
                <Card
                  key={project.id}
                  className={cn(
                    'cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-105',
                    'border-l-4',
                    project.priority === 'גבוהה' && 'border-l-red-500',
                    project.priority === 'בינונית' && 'border-l-yellow-500',
                    project.priority === 'נמוכה' && 'border-l-green-500'
                  )}
                  onClick={() => handleProjectClick(project.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate">
                          {project.name}
                        </CardTitle>
                        {project.client && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <User className="w-3 h-3" />
                            {project.client.name}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1 items-end">
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getStatusColor(project.status))}
                        >
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {project.status}
                        </Badge>
                        
                        <Badge 
                          variant="outline" 
                          className={cn('text-xs', getPriorityColor(project.priority))}
                        >
                          <PriorityIcon className="w-3 h-3 mr-1" />
                          {project.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {project.description}
                    </p>
                    
                    {/* Progress and Tasks */}
                    <div className="space-y-2">
                      {getTasksByProject(project.id).length > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">התקדמות</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Task Count */}
                      {pendingTasks > 0 && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">משימות ממתינות</span>
                          <Badge variant="secondary" className="text-xs">
                            {pendingTasks}
                          </Badge>
                        </div>
                      )}
                      
                      {/* Due Date */}
                      {project.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>יעד: {new Date(project.dueDate).toLocaleDateString('he-IL')}</span>
                        </div>
                      )}
                      
                      {/* Budget */}
                      {project.budget && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <DollarSign className="w-3 h-3" />
                          <span>
                            {new Intl.NumberFormat('he-IL', {
                              style: 'currency',
                              currency: 'ILS',
                              minimumFractionDigits: 0
                            }).format(project.budget)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-1 mt-3">
                      {project.folderPath && isTauriEnvironment() && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-6 px-2 text-xs gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenFolder(project.folderPath!);
                          }}
                        >
                          <FolderOpen className="w-3 h-3" />
                          פתח
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
