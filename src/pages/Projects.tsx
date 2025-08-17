import { useState } from 'react';
import { Plus, Search, Download, Edit, Trash2, FolderOpen, User, Phone, Mail, MessageCircle } from 'lucide-react';
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
      updateProject({ ...project, status });
    }
  };

  const handlePriorityChange = (projectId: string, priority: Priority) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      updateProject({ ...project, priority });
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
      case 'מושהה':
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
            <div className="absolute top-0 right-1/4 w-64 h-64 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              ניהול פרויקטים מתקדם
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              נהל את הפרויקטים שלך בצורה מקצועית ויעילה
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-primary">{projects.length}</div>
              <div className="text-sm text-muted-foreground">פרויקטים</div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{projects.filter(p => p.status === 'פעיל').length}</div>
              <div className="text-sm text-muted-foreground">פעילים</div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'הושלם').length}</div>
              <div className="text-sm text-muted-foreground">הושלמו</div>
            </div>
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <div className="text-2xl font-bold text-amber-600">{projects.filter(p => p.priority === 'גבוהה').length}</div>
              <div className="text-sm text-muted-foreground">דחופים</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
            {/* Export buttons - desktop only */}
            <div className="hidden lg:flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                className="gap-2 text-xs shadow-sm hover:shadow-md transition-all"
                size="sm"
              >
                <Download size={14} />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                className="gap-2 text-xs shadow-sm hover:shadow-md transition-all"
                size="sm"
              >
                <Download size={14} />
                JSON
              </Button>
            </div>
            
            {/* Main action button - centered and prominent */}
            <div className="pt-4">
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="gap-3 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-8"
                size="lg"
              >
                <Plus size={20} />
                <span className="font-semibold">פרויקט חדש</span>
              </Button>
            </div>
            
            {/* Export buttons for mobile - below main button */}
            <div className="flex lg:hidden items-center justify-center gap-3 pt-3">
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                className="gap-2 text-xs"
                size="sm"
              >
                <Download size={14} />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                className="gap-2 text-xs"
                size="sm"
              >
                <Download size={14} />
                JSON
              </Button>
            </div>
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
                    className="pr-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="סינון לפי סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסטטוסים</SelectItem>
                    <SelectItem value="תכנון">תכנון</SelectItem>
                    <SelectItem value="פעיל">פעיל</SelectItem>
                    <SelectItem value="הושלם">הושלם</SelectItem>
                    <SelectItem value="מושהה">מושהה</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as Priority | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="סינון לפי עדיפות" />
                  </SelectTrigger>
                  <SelectContent>
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

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">לא נמצאו פרויקטים</h3>
              <p className="text-muted-foreground">התחל ליצור פרויקטים חדשים או שנה את הסינון</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-0 shadow-md bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* פרטי לקוח */}
                    {project.client && (
                      <div className="client-info mb-4 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/30">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-sm">{project.client.name}</span>
                        </div>
                        {(project.client.email || project.client.phone || project.client.whatsapp || project.client.whatsappNumbers?.length) && (
                          <div className="flex items-center gap-1">
                            {project.client?.email && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => ClientContactService.openGmail(project.client!.email!)}
                                className="gap-1 h-7 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                              >
                                <Mail className="w-3 h-3" />
                              </Button>
                            )}
                            {(project.client?.whatsapp || project.client?.whatsappNumbers?.length) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const simple = project.client?.whatsapp;
                                  const primaryNumber = project.client?.whatsappNumbers?.find(w => w.isPrimary) || project.client?.whatsappNumbers?.[0];
                                  const numberToUse = simple || primaryNumber?.number;
                                  if (numberToUse) {
                                    ClientContactService.openWhatsApp(numberToUse);
                                  }
                                }}
                                className="gap-1 h-7 px-2 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </Button>
                            )}
                            {project.client?.phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => ClientContactService.openPhone(project.client!.phone!)}
                                className="gap-1 h-7 px-2 bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-700"
                              >
                                <Phone className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* תיקיית פרויקט */}
                    {project.folderPath && (
                      <div className="folder-info p-3 bg-amber-50/50 dark:bg-amber-900/20 rounded-lg border border-amber-200/30">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => FolderService.openInFinder(project.folderPath!)}
                          className="gap-2 w-full h-8 bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-700"
                        >
                          <FolderOpen className="w-4 h-4" />
                          <span className="text-xs">פתח תיקייה</span>
                        </Button>
                      </div>
                    )}

                    {/* תאריכים */}
                    <div className="dates-info mt-3 text-xs text-muted-foreground">
                      <div>התחלה: {new Date(project.startDate).toLocaleDateString('he-IL')}</div>
                      {project.dueDate && (
                        <div>יעד: {new Date(project.dueDate).toLocaleDateString('he-IL')}</div>
                      )}
                    </div>

                    {/* כפתורי פעולה */}
                    <div className="actions mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StatusSelector 
                          value={project.status} 
                          onChange={(status) => handleStatusChange(project.id, status)}
                        />
                        <PrioritySelector 
                          value={project.priority} 
                          onChange={(priority) => handlePriorityChange(project.id, priority)}
                        />
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(project)}
                          className="gap-1 h-8 px-3"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                          className="gap-1 h-8 px-3 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {/* רשימת משימות */}
                    <ProjectTaskList projectId={project.id} />

                    {/* סטטוס תשלום */}
                    <PaymentStatusButton project={project} />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog for adding/editing projects */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'עריכת פרויקט' : 'פרויקט חדש'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedProjectForm
            project={editingProject || undefined}
            onSubmit={() => {
              setIsDialogOpen(false);
              setEditingProject(null);
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingProject(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
