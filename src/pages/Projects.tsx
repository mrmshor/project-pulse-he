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
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FolderOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                מערכת ניהול פרויקטים Pro
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              נהל את הפרויקטים שלך בצורה מקצועית ויעילה עם ממשק מתקדם וכלים חכמים
            </p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300"></div>
              <div className="relative bg-blue-500 text-white rounded-2xl p-6 group-hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold mb-1">{projects.length}</div>
                <div className="text-blue-100 text-sm font-medium">סה"כ פרויקטים</div>
                <FolderOpen className="absolute top-4 left-4 w-6 h-6 text-blue-200 opacity-50" />
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300"></div>
              <div className="relative bg-green-500 text-white rounded-2xl p-6 group-hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold mb-1">{projects.filter(p => p.status === 'פעיל').length}</div>
                <div className="text-green-100 text-sm font-medium">פרויקטים בביצוע</div>
                <div className="absolute top-4 left-4 w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300"></div>
              <div className="relative bg-purple-500 text-white rounded-2xl p-6 group-hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold mb-1">{projects.filter(p => p.status === 'הושלם').length}</div>
                <div className="text-purple-100 text-sm font-medium">פרויקטים שהושלמו</div>
                <div className="text-xs text-purple-200 mt-1">
                  {projects.length > 0 ? Math.round((projects.filter(p => p.status === 'הושלם').length / projects.length) * 100) : 0}% מהפרויקטים
                </div>
              </div>
            </div>
            
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300"></div>
              <div className="relative bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 group-hover:scale-105 transition-transform duration-300">
                <div className="text-3xl font-bold mb-1">{projects.filter(p => p.priority === 'גבוהה').length}</div>
                <div className="text-orange-100 text-sm font-medium">אחוז תשלומים</div>
                <div className="text-xs text-orange-200 mt-1">0 מתוך {projects.length} שולמו</div>
              </div>
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
            <div className="pt-6">
              <Button 
                onClick={() => setIsDialogOpen(true)} 
                className="gap-3 bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/90 hover:via-blue-600/90 hover:to-purple-600/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 px-12 py-6 text-lg rounded-2xl"
                size="lg"
              >
                <Plus size={24} />
                <span className="font-bold">פרויקט חדש</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => {
                const statusColors = {
                  'תכנון': 'from-yellow-400 to-orange-500',
                  'פעיל': 'from-blue-500 to-indigo-600', 
                  'הושלם': 'from-green-500 to-emerald-600',
                  'מושהה': 'from-gray-400 to-gray-500',
                  'בוטל': 'from-red-400 to-red-500'
                } as const;
                
                const priorityIcons = {
                  'גבוהה': '🔥',
                  'בינונית': '⚡',
                  'נמוכה': '📋'
                };
                
                return (
                  <Card 
                    key={project.id} 
                    className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white/90 backdrop-blur-sm"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Gradient header */}
                    <div className={`h-2 bg-gradient-to-r ${statusColors[project.status] || statusColors['תכנון']}`}></div>
                    
                    <CardHeader className="pb-4 relative">
                      <div className="absolute top-4 left-4">
                        <div className="text-2xl">{priorityIcons[project.priority] || '📋'}</div>
                      </div>
                      
                      <div className="pr-12">
                        <CardTitle className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">
                          {project.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-4">
                        <Badge 
                          className={`bg-gradient-to-r ${statusColors[project.status]} text-white border-0 shadow-md font-medium px-3 py-1`}
                        >
                          {project.status}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`border-2 font-medium px-3 py-1 ${
                            project.priority === 'גבוהה' ? 'border-red-500 text-red-600' :
                            project.priority === 'בינונית' ? 'border-orange-500 text-orange-600' :
                            'border-green-500 text-green-600'
                          }`}
                        >
                          {project.priority}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-4">
                      {/* פרטי לקוח */}
                      {project.client && (
                        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full opacity-20 -translate-y-8 translate-x-8"></div>
                          <div className="relative">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-800">{project.client.name}</div>
                                {project.client.company && (
                                  <div className="text-xs text-gray-600">{project.client.company}</div>
                                )}
                              </div>
                            </div>
                            
                            {(project.client.email || project.client.phone || project.client.whatsapp || project.client.whatsappNumbers?.length) && (
                              <div className="flex items-center gap-2">
                                {project.client?.email && (
                                  <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 hover:border-green-300 transition-colors"
                                  >
                                    <a
                                      href={`mailto:${project.client!.email!}?subject=${encodeURIComponent(`בנוגע לפרויקט: ${project.name}`)}`}
                                      target="_top"
                                      rel="noreferrer noopener"
                                      aria-label="שלח אימייל"
                                    >
                                      <Mail className="w-4 h-4 text-green-600" />
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
                                    className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 hover:border-green-300 transition-colors"
                                  >
                                    <MessageCircle className="w-4 h-4 text-green-600" />
                                  </Button>
                                )}
                                {project.client?.phone && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => ClientContactService.openPhone(project.client!.phone!)}
                                    className="h-8 w-8 p-0 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                                  >
                                    <Phone className="w-4 h-4 text-orange-600" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* תיקיית פרויקט */}
                      {project.folderPath && (
                        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100">
                          <div className="absolute top-0 left-0 w-16 h-16 bg-amber-200 rounded-full opacity-20 -translate-y-6 -translate-x-6"></div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => FolderService.openInFinder(project.folderPath!)}
                            className="w-full gap-3 h-10 border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-colors relative z-10"
                          >
                            <FolderOpen className="w-5 h-5 text-amber-600" />
                            <span className="font-medium text-amber-700">פתח תיקיית פרויקט</span>
                          </Button>
                        </div>
                      )}

                      {/* תאריכים ומידע נוסף */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">התחלה</div>
                          <div className="text-sm font-medium text-gray-800">
                            {new Date(project.startDate).toLocaleDateString('he-IL')}
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1">יעד</div>
                          <div className="text-sm font-medium text-gray-800">
                            {project.dueDate ? new Date(project.dueDate).toLocaleDateString('he-IL') : 'לא נקבע'}
                          </div>
                        </div>
                      </div>

                      {/* כפתורי פעולה */}
                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
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
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(project)}
                            className="gap-2 h-9 px-4 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            <span>ערוך</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(project.id)}
                            className="gap-2 h-9 px-4 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>מחק</span>
                          </Button>
                        </div>
                      </div>

                      {/* רשימת משימות */}
                      <ProjectTaskList projectId={project.id} />

                      {/* סטטוס תשלום */}
                      <PaymentStatusButton project={project} />
                    </CardContent>
                  </Card>
                );
              })}
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
