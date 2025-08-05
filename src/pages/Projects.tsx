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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent">פרויקטים</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            className="gap-2"
          >
            <Download size={16} />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            className="gap-2"
          >
            <Download size={16} />
            JSON
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="btn-gradient transition-smooth hover:shadow-glow gap-2">
            <Plus size={16} />
            פרויקט חדש
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="חיפוש פרויקטים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-glass pr-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            <SelectItem value="תכנון">תכנון</SelectItem>
            <SelectItem value="פעיל">פעיל</SelectItem>
            <SelectItem value="הושלם">הושלם</SelectItem>
            <SelectItem value="בהמתנה">בהמתנה</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as Priority | 'all')}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="עדיפות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל העדיפויות</SelectItem>
            <SelectItem value="נמוכה">נמוכה</SelectItem>
            <SelectItem value="בינונית">בינונית</SelectItem>
            <SelectItem value="גבוהה">גבוהה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const projectTasks = getTasksByProject(project.id);
          const completedTasks = projectTasks.filter(task => task.status === 'הושלמה').length;
          
          return (
            <Card key={project.id} className="card-macos animate-slide-up"
              style={{ animationDelay: `${filteredProjects.indexOf(project) * 0.1}s` }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project.id)}
                      className="text-danger hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{project.description}</p>
                
                {/* פרטי לקוח */}
                {project.client?.name && (
                  <div className="client-info">
                    <div className="flex items-center gap-2 mb-2">
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
                          className="gap-1 h-7 px-2"
                        >
                          <MessageCircle className="w-3 h-3" />
                        </Button>
                      )}
                      {project.client.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => ClientContactService.openGmail(project.client.email!, `בנוגע לפרויקט: ${project.name}`)}
                          className="gap-1 h-7 px-2"
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                      )}
                      {project.client.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => ClientContactService.dialNumber(project.client.phone!)}
                          className="gap-1 h-7 px-2"
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* תיקיית פרויקט */}
                {project.folderPath && (
                  <div className="folder-info">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => FolderService.openInFinder(project.folderPath!)}
                      className="gap-2 w-full"
                    >
                      <FolderOpen className="w-4 h-4" />
                      פתח תיקיית פרויקט
                    </Button>
                  </div>
                )}
                
                {/* סטטוס תשלום */}
                {project.payment?.amount && (
                  <div className="payment-status">
                    <PaymentStatusButton
                      projectId={project.id}
                      isPaid={project.payment.isPaid}
                      amount={project.payment.amount}
                      currency={project.payment.currency}
                      size="sm"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <StatusSelector 
                    currentStatus={project.status}
                    onStatusChange={(status) => handleStatusChange(project.id, status)}
                  />
                  <PrioritySelector 
                    currentPriority={project.priority}
                    onPriorityChange={(priority) => handlePriorityChange(project.id, priority)}
                  />
                </div>

                {/* רשימת משימות מהירה */}
                <ProjectTaskList projectId={project.id} project={project} />

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
        <div className="text-center py-12">
          <p className="text-muted-foreground">לא נמצאו פרויקטים</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setEditingProject(null);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
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