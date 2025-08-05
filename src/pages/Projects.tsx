import { useState } from 'react';
import { Plus, Search, Filter, Download, Edit, Trash2, FolderOpen, User, Phone, Mail, MessageCircle } from 'lucide-react';
import { FolderService, ClientContactService } from '@/services/nativeServices';
import { StatusSelector } from '@/components/StatusSelector';
import { PrioritySelector } from '@/components/PrioritySelector';
import { ProjectTaskList } from '@/components/ProjectTaskList';
import { PaymentStatusButton } from '@/components/PaymentStatusButton';
import { useProjectStore } from '@/store/useProjectStore';
import { Project, ProjectStatus, Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { EnhancedProjectForm } from '@/components/EnhancedProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isTauriEnvironment, exportFileNative } from '@/lib/tauri';

export function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const {
    projects,
    deleteProject,
    updateProject,
    exportToCSV,
    exportToJSON,
    getTasksByProject,
  } = useProjectStore();

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleDelete = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את הפרויקט?')) {
      deleteProject(id);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleExport = async (format: 'csv' | 'json') => {
    let content: string;
    let filename: string;

    if (format === 'csv') {
      content = exportToCSV('projects');
      filename = 'projects.csv';
    } else {
      content = exportToJSON();
      filename = 'projects.json';
    }

    if (isTauriEnvironment()) {
      await exportFileNative(content, filename, format);
    } else {
      const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleStatusChange = (projectId: string, status: ProjectStatus) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, { ...project, status });
    }
  };

  const handlePriorityChange = (projectId: string, priority: Priority) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, { ...project, priority });
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case 'תכנון':
        return 'bg-muted text-muted-foreground';
      case 'פעיל':
        return 'bg-primary text-primary-foreground';
      case 'הושלם':
        return 'bg-success text-success-foreground';
      case 'בהמתנה':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'נמוכה':
        return 'text-success';
      case 'בינונית':
        return 'text-primary';
      case 'גבוהה':
        return 'text-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
      {/* Fixed Header & Filters */}
      <div className="flex-shrink-0 bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="text-center space-y-6 py-8 px-6 relative">
          {/* Background decorative elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-10 left-1/3 w-48 h-48 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-2 animate-fade-in">
              מערכת ניהול פרויקטים Pro
            </h1>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-lg"></div>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ניהול ומעקב מתקדם אחר כל הפרויקטים שלך במקום אחד
          </p>
          
          <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>{projects.length} פרויקטים פעילים</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{filteredProjects.length} מוצגים</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
              className="gap-2"
              size="sm"
            >
              <Download size={16} />
              יצוא CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('json')}
              className="gap-2"
              size="sm"
            >
              <Download size={16} />
              יצוא JSON
            </Button>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="gap-2 bg-primary hover:bg-primary/90"
              size="sm"
            >
              <Plus size={16} />
              פרויקט חדש
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="pb-6 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="חיפוש פרויקטים..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}>
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 z-50">
                    <SelectItem value="all">כל הסטטוסים</SelectItem>
                    <SelectItem value="תכנון">תכנון</SelectItem>
                    <SelectItem value="פעיל">פעיל</SelectItem>
                    <SelectItem value="הושלם">הושלם</SelectItem>
                    <SelectItem value="בהמתנה">בהמתנה</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as Priority | 'all')}>
                  <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600">
                    <SelectValue placeholder="בחר עדיפות" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 z-50">
                    <SelectItem value="all">כל העדיפויות</SelectItem>
                    <SelectItem value="נמוכה">נמוכה</SelectItem>
                    <SelectItem value="בינונית">בינונית</SelectItem>
                    <SelectItem value="גבוהה">גבוהה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Projects Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">{filteredProjects.length === 0 ? (
            <div className="max-w-md mx-auto text-center py-16">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">אין פרויקטים להצגה</h3>
                <p className="text-muted-foreground">נסה לשנות את הפילטרים או ליצור פרויקט חדש</p>
              </div>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => {
          const projectTasks = getTasksByProject(project.id);
          const completedTasks = projectTasks.filter(task => task.status === 'הושלמה').length;
      
          return (
            <Card 
              key={project.id} 
              id={`project-${project.id}`}
              className="card-macos animate-scale-in group cursor-pointer relative overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Floating action buttons */}
              <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(project)}
                  className="btn-glass w-10 h-10 p-0 hover:scale-110 transition-transform"
                >
                  <Edit size={16} />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleDelete(project.id)}
                  className="btn-glass w-10 h-10 p-0 hover:scale-110 transition-transform text-danger hover:text-danger"
                >
                  <Trash2 size={16} />
                </Button>
              </div>

              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold leading-tight relative group-hover:text-primary transition-colors duration-300">
                  {project.name}
                  <div className="absolute -bottom-1 right-0 w-0 group-hover:w-8 h-0.5 bg-primary transition-all duration-300"></div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                
                {/* פרטי לקוח */}
                {project.client?.name && (
                  <div className="client-info p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-200/30">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium">{project.client.name}</span>
                      {project.client.company && (
                        <span className="text-muted-foreground text-sm">• {project.client.company}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {project.client.whatsapp && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => ClientContactService.openWhatsApp(project.client.whatsapp!)}
                          className="gap-1 h-7 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                      )}
                      {project.client.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => ClientContactService.openGmail(project.client.email!, `בנוגע לפרויקט: ${project.name}`)}
                          className="gap-1 h-7 px-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                      )}
                      {project.client.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => ClientContactService.dialNumber(project.client.phone!)}
                          className="gap-1 h-7 px-2 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* תיקיית פרויקט */}
                {project.folderPath && (
                  <div className="folder-info p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg border border-amber-200/30">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => FolderService.openInFinder(project.folderPath!)}
                      className="gap-2 w-full bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"
                    >
                      <FolderOpen className="w-4 h-4" />
                      פתח תיקיית פרויקט
                    </Button>
                  </div>
                )}
                
                {/* סטטוס תשלום */}
                {project.payment?.amount && (
                  <div className="payment-status p-3 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200/30">
                    <PaymentStatusButton
                      projectId={project.id}
                      isPaid={project.payment.isPaid}
                      amount={project.payment.amount}
                      currency={project.payment.currency}
                      size="sm"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between gap-3">
                  <StatusSelector 
                    currentStatus={project.status}
                    onStatusChange={(status) => handleStatusChange(project.id, status)}
                  />
                  <PrioritySelector 
                    currentPriority={project.priority}
                    onPriorityChange={(priority) => handlePriorityChange(project.id, priority)}
                  />
                </div>

                {/* רשימת משימות */}
                <div className="tasks-container p-4 bg-gradient-to-br from-blue-50/40 to-indigo-50/40 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200/30 dark:border-blue-700/30">
                  <ProjectTaskList projectId={project.id} project={project} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>התקדמות:</span>
                    <span>{completedTasks}/{projectTasks.length}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: projectTasks.length > 0 ? `${(completedTasks / projectTasks.length) * 100}%` : '0%'
                      }}
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground space-y-1">
                  <div>התחלה: {new Date(project.startDate).toLocaleDateString('he-IL')}</div>
                  {project.dueDate && (
                    <div>יעד: {new Date(project.dueDate).toLocaleDateString('he-IL')}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setEditingProject(null);
      }}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-semibold">
              {editingProject ? 'עריכת פרויקט' : 'פרויקט חדש'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedProjectForm
            project={editingProject}
            onSave={() => setIsDialogOpen(false)}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}