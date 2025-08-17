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


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white dark:bg-background border-b">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-foreground">
              פרויקטים מתקדם
            </h1>
            <p className="text-muted-foreground">
              נהל את הפרויקטים שלך בצורה מקצועית ויעילה
            </p>
          </div>

          {/* Action button */}
          <div className="pt-6">
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-6 py-2"
              size="default"
            >
              <Plus size={16} className="ml-2" />
              פרויקט חדש
            </Button>
          </div>

        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-background border-b px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                placeholder="חיפוש פרויקטים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}>
              <SelectTrigger className="w-full md:w-48">
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
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="סינון לפי עדיפות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל העדיפויות</SelectItem>
                <SelectItem value="נמוכה">נמוכה</SelectItem>
                <SelectItem value="בינונית">בינונית</SelectItem>
                <SelectItem value="גבוהה">גבוהה</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                size="sm"
              >
                <Download size={14} className="ml-1" />
                CSV
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('json')}
                size="sm"
              >
                <Download size={14} className="ml-1" />
                JSON
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Projects Grid */}
      <div className="flex-1 bg-gray-50/30 dark:bg-gray-900/30">
        <div className="max-w-6xl mx-auto p-6">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">לא נמצאו פרויקטים</h3>
              <p className="text-muted-foreground">התחל ליצור פרויקטים חדשים או שנה את הסינון</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <Card key={project.id} className="rounded-2xl bg-white dark:bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-blue-700 dark:text-blue-400">
                      {project.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {project.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {project.priority}
                      </Badge>
                    </div>
                    {project.budget != null && (
                      <div className="mt-2 text-sm font-medium text-green-600">
                        ₪{Number(project.budget).toLocaleString('he-IL')}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0 space-y-4">
                    {/* פרטי לקוח */}
                    {project.client && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-sm">{project.client.name}</span>
                        </div>
                        {(project.client.email || project.client.phone || project.client.whatsapp || project.client.whatsappNumbers?.length) && (
                          <div className="flex items-center gap-2">
                            {project.client?.email && (
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="h-8 px-3 text-xs"
                              >
                                <a
                                  href={`mailto:${project.client!.email!}?subject=${encodeURIComponent(`בנוגע לפרויקט: ${project.name}`)}`}
                                  target="_top"
                                  rel="noreferrer noopener"
                                  aria-label="שלח אימייל"
                                >
                                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> מייל</span>
                                </a>
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
                                className="h-8 px-3 text-xs"
                              >
                                <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> וואטסאפ</span>
                              </Button>
                            )}
                            {project.client?.phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => ClientContactService.openPhone(project.client!.phone!)}
                                className="h-8 px-3 text-xs"
                              >
                                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> חייג</span>
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* תיקיית פרויקט */}
                    {project.folderPath && (
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => FolderService.openInFinder(project.folderPath!)}
                          className="gap-2 w-full h-9 text-sm"
                        >
                          <FolderOpen className="w-4 h-4" />
                          פתח תיקייה
                        </Button>
                      </div>
                    )}

                    {/* תאריכים */}
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>התחלה: {new Date(project.startDate).toLocaleDateString('he-IL')}</div>
                      {project.dueDate && (
                        <div>יעד: {new Date(project.dueDate).toLocaleDateString('he-IL')}</div>
                      )}
                    </div>

                    {/* כפתורי פעולה */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
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
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(project)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(project.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
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
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl">
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
