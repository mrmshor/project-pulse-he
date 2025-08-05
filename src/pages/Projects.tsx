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
    <div className="min-h-screen bg-gradient-ambient">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-primary/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-radial from-accent/15 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute top-40 right-1/3 w-32 h-32 bg-gradient-radial from-secondary/25 to-transparent rounded-full blur-xl"></div>
        </div>
        
        <div className="container mx-auto px-8 pt-12 pb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-4">
              <div className="relative">
                <h1 className="text-6xl font-display font-bold gradient-primary bg-clip-text text-transparent leading-tight">
                  פרויקטים
                </h1>
                <div className="absolute -bottom-2 right-0 w-32 h-1.5 bg-gradient-to-l from-primary via-primary-glow to-accent rounded-full shadow-glow"></div>
              </div>
              <p className="text-xl text-muted-foreground max-w-md leading-relaxed">
                ניהול ומעקב מתקדם אחר כל הפרויקטים שלך במקום אחד
              </p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <span>{projects.length} פרויקטים פעילים</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span>{filteredProjects.length} מוצגים</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleExport('csv')}
                  className="gap-2 glass-effect hover:shadow-elegant transition-all duration-300 hover:scale-105"
                >
                  <Download size={16} />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleExport('json')}
                  className="gap-2 glass-effect hover:shadow-elegant transition-all duration-300 hover:scale-105"
                >
                  <Download size={16} />
                  JSON
                </Button>
              </div>
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="btn-gradient gap-2 shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2 hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Plus size={18} />
                <span className="font-medium">פרויקט חדש</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

        <div className="container mx-auto px-8 space-y-8">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 card-macos">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="חיפוש פרויקטים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-glass pr-10 text-lg font-medium"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}>
              <SelectTrigger className="input-glass">
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                <SelectItem value="תכנון">תכנון</SelectItem>
                <SelectItem value="פעיל">פעיל</SelectItem>
                <SelectItem value="הושלם">הושלם</SelectItem>
                <SelectItem value="בהמתנה">בהמתנה</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as Priority | 'all')}>
              <SelectTrigger className="input-glass">
                <SelectValue placeholder="בחר עדיפות" />
              </SelectTrigger>
              <SelectContent className="glass">
                <SelectItem value="all">כל העדיפויות</SelectItem>
                <SelectItem value="נמוכה">נמוכה</SelectItem>
                <SelectItem value="בינונית">בינונית</SelectItem>
                <SelectItem value="גבוהה">גבוהה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
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

          {filteredProjects.length === 0 && (
            <div className="text-center py-16 card-macos">
              <div className="animate-bounce-subtle">
                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-semibold mb-2">אין פרויקטים להצגה</h3>
              <p className="text-muted-foreground">נסה לשנות את הפילטרים או ליצור פרויקט חדש</p>
            </div>
          )}

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingProject(null);
          }}>
            <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto glass border-0 shadow-elegant">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-display">
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
    </div>
  );
}