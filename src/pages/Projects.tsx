import { useState } from 'react';
import { Plus, Search, Download, Edit, Trash2, FolderOpen, User, Phone, Mail, MessageCircle, CheckCircle2 } from 'lucide-react';
import { FolderService, ClientContactService } from '@/services/nativeServices';
import { StatusSelector } from '@/components/StatusSelector';
import { PrioritySelector } from '@/components/PrioritySelector';

import { PaymentStatusButton } from '@/components/PaymentStatusButton';
import { useProjectStore } from '@/store/useProjectStore';
import { Project, ProjectStatus, Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

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
              {filteredProjects.map((project) => {
                const tasks = getTasksByProject(project.id);
                const completedCount = tasks.filter((t) => t.completed).length;
                const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

                return (
                  <Card
                    key={project.id}
                    className={`border-r-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer bg-white dark:bg-card border border-border ${
                      ({ 'גבוהה': 'border-r-red-500', 'בינונית': 'border-r-amber-500', 'נמוכה': 'border-r-emerald-500' } as const)[project.priority]
                    }`}
                  >
                    {/* Header Section */}
                    <div className="p-6 pb-3 bg-gradient-to-r from-white/50 to-transparent backdrop-blur">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2 leading-tight line-clamp-2 tracking-wide hover:from-blue-600 hover:via-purple-500 hover:to-blue-700 transition-colors duration-300">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                              {project.client?.name || '—'}
                            </span>
                          </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-100 text-blue-600" onClick={() => handleEdit(project)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-100 text-red-500" onClick={() => handleDelete(project.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Status and Priority Selectors */}
                      <div className="flex gap-2 mb-3">
                        <StatusSelector value={project.status} onChange={(status) => handleStatusChange(project.id, status)} />
                        <PrioritySelector value={project.priority} onChange={(priority) => handlePriorityChange(project.id, priority)} />
                      </div>
                    </div>

                    <div className="px-6 space-y-4">
                      {/* Description */}
                      {project.description && (
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 rounded-lg border border-gray-200/50">
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed italic">
                            "{project.description}"
                          </p>
                        </div>
                      )}

                      {/* Price Section */}
                      {(project.budget != null) && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200/50">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-semibold text-green-600">
                              {`₪${Number(project.budget).toLocaleString('he-IL')}`}
                            </div>
                            <div className="flex gap-2">
                              <PaymentStatusButton project={project} />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Contact Actions */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200/50">
                        <div className="flex flex-wrap gap-2">
                          {project.client?.email && (
                            <Button asChild variant="outline" size="sm" className="h-8 px-3 text-xs">
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
                          {project.folderPath && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => FolderService.openInFinder(project.folderPath!)}
                              className="text-xs hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700"
                            >
                              <FolderOpen className="h-3 w-3 mr-1" />
                              פתח תיקיה
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Tasks Section */}
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200/50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                            משימות ({completedCount}/{tasks.length})
                          </h4>
                          <span className="text-xs text-muted-foreground">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full overflow-hidden h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-blue-600 h-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
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
