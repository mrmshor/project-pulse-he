import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderService, ClientContactService } from '@/services/nativeServices';
import { Project } from '@/types';
import { 
  FolderOpen, 
  Phone, 
  Mail, 
  MessageCircle, 
  User, 
  
  ExternalLink,
  Calendar,
  CheckCircle
} from 'lucide-react';

interface EnhancedProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  tasks: any[];
  contacts: any[];
}

export function EnhancedProjectCard({ project, onEdit, onDelete, tasks, contacts }: EnhancedProjectCardProps) {
  const [folderExists, setFolderExists] = useState<boolean | null>(null);

  const projectTasks = tasks.filter(task => task.projectId === project.id);
  const completedTasks = projectTasks.filter(task => task.status === 'הושלם');
  const projectContacts = contacts.filter(contact => 
    contact.projectIds?.includes(project.id) || false
  );

  useEffect(() => {
    if (project.folderPath) {
      FolderService.validateFolderPath(project.folderPath)
        .then(setFolderExists)
        .catch(() => setFolderExists(false));
    }
  }, [project.folderPath]);

  // פתיחת תיקיה
  const handleOpenFolder = async () => {
    if (project.folderPath) {
      const success = await FolderService.openInFinder(project.folderPath);
      if (!success) {
        alert('לא ניתן לפתוח את התיקיה. ייתכן שהיא נמחקה או הועברה.');
      }
    }
  };

  // פתיחת WhatsApp
  const handleOpenWhatsApp = async (whatsappNumber?: string) => {
    if (!project.client) return;
    
    if (!whatsappNumber) {
      const primaryWhatsApp = project.client.whatsappNumbers?.find(w => w.isPrimary && w.number);
      whatsappNumber = primaryWhatsApp?.number || project.client.whatsappNumbers?.[0]?.number;
    }
    
    if (whatsappNumber) {
      const success = await ClientContactService.openWhatsApp(whatsappNumber);
      if (!success) {
        alert('לא ניתן לפתוח WhatsApp');
      }
    }
  };

  // פתיחת Gmail
  const handleOpenGmail = async () => {
    if (project.client?.email) {
      const success = await ClientContactService.openGmail(
        project.client.email, 
        `בנוגע לפרויקט: ${project.name}`
      );
      if (!success) {
        alert('לא ניתן לפתוח Gmail');
      }
    }
  };

  // חיוג
  const handleDialPhone = async () => {
    if (project.client?.phone) {
      const success = await ClientContactService.openPhone(project.client.phone);
      if (!success) {
        alert('לא ניתן לחייג');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'הושלם': return 'bg-green-100 text-green-800 border-green-200';
      case 'פעיל': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'תכנון': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'בהמתנה': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'גבוהה': return 'bg-red-100 text-red-800 border-red-200';
      case 'בינונית': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'נמוכה': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="card-macos animate-slide-up hover:shadow-elegant transition-smooth">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{project.name}</CardTitle>
            <p className="text-muted-foreground text-sm">{project.description}</p>
          </div>
          <div className="flex gap-2">
            <Badge className={`${getStatusColor(project.status)} transition-smooth hover:scale-105`}>
              {project.status}
            </Badge>
            <Badge className={`${getPriorityColor(project.priority)} transition-smooth hover:scale-105`}>
              {project.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* פרטי לקוח */}
        {project.client?.name && (
          <div className="glass p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-primary" />
              <span className="font-medium">{project.client?.name}</span>
              {project.client?.company && (
                <span className="text-muted-foreground text-sm">• {project.client.company}</span>
              )}
            </div>
            
            <div className="flex gap-2">
              {project.client?.whatsappNumbers?.filter(w => w.number && w.number.trim()).map((whatsapp, index) => (
                <Button
                  key={whatsapp.id || index}
                  onClick={() => handleOpenWhatsApp(whatsapp.number)}
                  size="sm"
                  className="btn-glass hover:bg-green-500 hover:text-white transition-smooth"
                  title={`פתח WhatsApp - ${whatsapp.label || 'WhatsApp'}${whatsapp.isPrimary ? ' (עיקרי)' : ''}`}
                >
                  <MessageCircle size={14} />
                  {(project.client?.whatsappNumbers?.filter(w => w.number && w.number.trim()).length || 0) > 1 && (
                    <span className="text-xs ml-1">{index + 1}</span>
                  )}
                </Button>
              ))}
              
              {project.client?.email && (
                <Button
                  onClick={handleOpenGmail}
                  size="sm"
                  className="btn-glass hover:bg-blue-500 hover:text-white transition-smooth"
                  title="שלח אימייל"
                >
                  <Mail size={14} />
                </Button>
              )}
              
              {project.client?.phone && (
                <Button
                  onClick={handleDialPhone}
                  size="sm"
                  className="btn-glass hover:bg-orange-500 hover:text-white transition-smooth"
                  title="חייג"
                >
                  <Phone size={14} />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* סטטיסטיקות פרויקט */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">משימות</span>
            </div>
            <div className="text-lg font-bold">
              {completedTasks.length}/{projectTasks.length}
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">אנשי קשר</span>
            </div>
            <div className="text-lg font-bold">{projectContacts.length}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium">יעד</span>
            </div>
            <div className="text-xs">
              {project.dueDate ? 
                new Date(project.dueDate).toLocaleDateString('he-IL') : 
                'לא נקבע'
              }
            </div>
          </div>
        </div>

        {/* פעולות מהירות */}
        {project.folderPath && (
          <div className="space-y-2">
            <Button
              onClick={handleOpenFolder}
              variant="outline"
              size="sm"
              className={`w-full gap-2 transition-smooth ${
                folderExists === false ? 'border-red-300 text-red-600' : 'hover:shadow-elegant'
              }`}
            >
              <FolderOpen size={16} />
              <span>פתח תיקיה</span>
              {folderExists === false && <span className="text-xs">(לא נמצאה)</span>}
              <ExternalLink size={12} className="mr-auto" />
            </Button>
          </div>
        )}

        {/* תגיות */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag.id}
                className="text-xs px-2 py-0 transition-smooth hover:scale-105"
                style={{ 
                  backgroundColor: tag.color + '20',
                  color: tag.color,
                  border: `1px solid ${tag.color}40`
                }}
              >
                {tag.name}
              </Badge>
            ))}
            {project.tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-2 py-0">
                +{project.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* כפתורי פעולה */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onEdit(project)} 
            variant="outline" 
            size="sm"
            className="flex-1 transition-smooth hover:shadow-elegant"
          >
            ערוך פרויקט
          </Button>
          <Button 
            onClick={() => onDelete(project.id)} 
            variant="destructive" 
            size="sm"
            className="transition-smooth hover:shadow-elegant"
          >
            מחק
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}