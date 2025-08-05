import { useState, useEffect } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Contact } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
}

export function ContactDialog({ open, onOpenChange, contact }: ContactDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    projectIds: [] as string[],
  });

  const { addContact, updateContact, projects } = useProjectStore();

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email || '',
        phone: contact.phone || '',
        projectIds: contact.projectIds,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        projectIds: [],
      });
    }
  }, [contact, open]);

  const validatePhone = (phone: string) => {
    // Israeli phone validation: 05X-XXXXXXX
    const phoneRegex = /^05[0-9]-[0-9]{7}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.phone && !validatePhone(formData.phone)) {
      alert('פורמט טלפון לא תקין. השתמש בפורמט: 05X-XXXXXXX');
      return;
    }
    
    const contactData = {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      projectIds: formData.projectIds,
      tags: [], // Initialize with empty tags array
    };

    if (contact) {
      updateContact(contact.id, contactData);
    } else {
      addContact(contactData);
    }

    onOpenChange(false);
  };

  const handleProjectToggle = (projectId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        projectIds: [...formData.projectIds, projectId],
      });
    } else {
      setFormData({
        ...formData,
        projectIds: formData.projectIds.filter((id) => id !== projectId),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {contact ? 'עריכת איש קשר' : 'איש קשר חדש'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">שם</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">טלפון (פורמט: 05X-XXXXXXX)</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="050-1234567"
            />
          </div>

          {projects.length > 0 && (
            <div className="space-y-2">
              <Label>פרויקטים קשורים</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
                {projects.map((project) => (
                  <div key={project.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`project-${project.id}`}
                      checked={formData.projectIds.includes(project.id)}
                      onCheckedChange={(checked) => 
                        handleProjectToggle(project.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`project-${project.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {project.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ביטול
            </Button>
            <Button type="submit">
              {contact ? 'עדכן' : 'צור איש קשר'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}