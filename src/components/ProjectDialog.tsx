import { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Project, ProjectStatus, Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
}

export function ProjectDialog({ open, onOpenChange, project }: ProjectDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'תכנון' as ProjectStatus,
    priority: 'בינונית' as Priority,
    startDate: '',
    dueDate: '',
  });

  const { addProject, updateProject } = useProjectStore();

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        startDate: new Date(project.startDate).toISOString().split('T')[0],
        dueDate: project.dueDate 
          ? new Date(project.dueDate).toISOString().split('T')[0] 
          : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'תכנון',
        priority: 'בינונית',
        startDate: new Date().toISOString().split('T')[0],
        dueDate: '',
      });
    }
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      startDate: new Date(formData.startDate),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      tags: [], // Initialize with empty tags array
      reminders: [], // Initialize with empty reminders array
      folderPath: undefined, // Will be set later via folder selection
      client: {
        name: '',
        whatsapp: '',
        email: '',
        phone: '',
        company: '',
        notes: ''
      },
      payment: {
        amount: undefined,
        currency: 'ILS' as const,
        isPaid: false,
        notes: ''
      }
    };

    if (project) {
      updateProject(project.id, projectData);
    } else {
      addProject(projectData);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {project ? 'עריכת פרויקט' : 'פרויקט חדש'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם הפרויקט</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>סטטוס</Label>
              <Select
                value={formData.status}
                onValueChange={(value: ProjectStatus) => 
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="תכנון">תכנון</SelectItem>
                  <SelectItem value="פעיל">פעיל</SelectItem>
                  <SelectItem value="הושלם">הושלם</SelectItem>
                  <SelectItem value="בהמתנה">בהמתנה</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>עדיפות</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: Priority) => 
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="נמוכה">נמוכה</SelectItem>
                  <SelectItem value="בינונית">בינונית</SelectItem>
                  <SelectItem value="גבוהה">גבוהה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">תאריך התחלה</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">תאריך יעד</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit">
              {project ? 'עדכן' : 'צור פרויקט'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}