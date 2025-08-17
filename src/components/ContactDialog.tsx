import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Contact, Project } from '@/types';
import { useProjectStore } from '@/store/useProjectStore';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  MapPin, 
  FileText,
  Star,
  Plus,
  X
} from 'lucide-react';


interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
  projects?: Project[];
}

const contactTypeOptions = [
  { value: 'לקוח', label: 'לקוח', icon: User },
  { value: 'ספק', label: 'ספק', icon: Building },
  { value: 'שותף', label: 'שותף', icon: Star },
  { value: 'עמית', label: 'עמית', icon: User },
  { value: 'אחר', label: 'אחר', icon: FileText }
] as const;

export function ContactDialog({ 
  isOpen, 
  onClose, 
  contact, 
  projects = [] 
}: ContactDialogProps) {
  const { addContact, updateContact } = useProjectStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: '',
    type: 'לקוח' as Contact['type'],
    tags: [] as string[]
  });
  
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens/closes or contact changes
  useEffect(() => {
    if (isOpen) {
      if (contact) {
        setFormData({
          name: contact.name || '',
          email: contact.email || '',
          phone: contact.phone || '',
          company: contact.company || '',
          address: contact.address || '',
          notes: contact.notes || '',
          type: contact.type || 'לקוח',
          tags: (contact.tags?.map(t => t.name) || [])
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          address: '',
          notes: '',
          type: 'לקוח',
          tags: []
        });
      }
    }
  }, [isOpen, contact]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (!newTag.trim() || formData.tags.includes(newTag.trim())) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, newTag.trim()]
    }));
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "שגיאה",
        description: "שם איש הקשר הוא שדה חובה",
        variant: "destructive"
      });
      return false;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      toast({
        title: "שגיאה",
        description: "כתובת אימייל לא תקינה",
        variant: "destructive"
      });
      return false;
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      toast({
        title: "שגיאה",
        description: "מספר טלפון לא תקין",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 9;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const contactData: Omit<Contact, 'id'> = {
        ...formData,
        createdAt: contact?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: formData.tags.map(tag => ({ name: tag, color: '#3B82F6', id: Date.now().toString() + Math.random().toString() }))
      };

      if (contact) {
        // Update existing contact
        await updateContact({
          ...contactData,
          id: contact.id
        });
        
        toast({
          title: "איש קשר עודכן",
          description: `איש הקשר "${formData.name}" עודכן בהצלחה`,
        });
      } else {
        // Add new contact
        await addContact(contactData);
        
        toast({
          title: "איש קשר נוסף",
          description: `איש הקשר "${formData.name}" נוסף בהצלחה`,
        });
      }
      
      onClose();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת איש הקשר",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: Contact['type']) => {
    const typeConfig = contactTypeOptions.find(option => option.value === type);
    return typeConfig?.icon || User;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {React.createElement(getTypeIcon(formData.type), { className: "w-5 h-5" })}
            {contact ? 'עריכת איש קשר' : 'הוספת איש קשר חדש'}
          </DialogTitle>
          <DialogDescription>
            {contact 
              ? 'ערוך את פרטי איש הקשר' 
              : 'הוסף איש קשר חדש למערכת'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                <User className="w-4 h-4" />
                שם מלא <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="הכנס שם מלא..."
                className="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type" className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                סוג איש קשר
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contactTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        {React.createElement(option.icon, { className: "w-4 h-4" })}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                אימייל
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="example@email.com"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                טלפון
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="052-123-4567"
                dir="ltr"
              />
            </div>
          </div>

          {/* Company and Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-1">
                <Building className="w-4 h-4" />
                חברה/ארגון
              </Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="שם החברה..."
                className="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                כתובת
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="כתובת מלאה..."
                className="rtl"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              תגיות
            </Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="הוסף תגית..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="rtl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 hover:bg-transparent"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              הערות
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="הערות נוספות על איש הקשר..."
              rows={4}
              className="rtl"
            />
          </div>

          {/* Related Projects */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                פרויקטים קשורים
              </Label>
              <div className="text-sm text-muted-foreground">
                {projects.filter(p => p.client?.id === contact?.id).length > 0 ? (
                  <div className="space-y-1">
                    {projects
                      .filter(p => p.client?.id === contact?.id)
                      .map(project => (
                        <Badge key={project.id} variant="outline">
                          {project.name}
                        </Badge>
                      ))
                    }
                  </div>
                ) : (
                  'אין פרויקטים קשורים'
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ביטול
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.name.trim()}
          >
            {isSubmitting ? 'שומר...' : contact ? 'עדכן' : 'הוסף'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
