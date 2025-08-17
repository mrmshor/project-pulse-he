import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FolderService } from '@/services/nativeServices';

import { Project, ProjectStatus, Priority, PaymentStatus } from '@/types';
import { useProjectStore } from '@/store/useProjectStore';
import { useToast } from '@/hooks/use-toast';
import { StatusSelector } from './StatusSelector';
import { PrioritySelector } from './PrioritySelector';
import { 
  Calendar,
  DollarSign,
  User,
  FileText,
  FolderOpen,
  
  Target,
  Building,
  Plus,
  X,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedProjectFormProps {
  project?: Project | null;
  onSubmit: (project: Project) => void;
  onCancel: () => void;
  className?: string;
}

export function EnhancedProjectForm({ 
  project, 
  onSubmit, 
  onCancel, 
  className 
}: EnhancedProjectFormProps) {
  const { contacts, addProject, updateProject } = useProjectStore();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'תכנון' as ProjectStatus,
    priority: 'בינונית' as Priority,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    budget: '',
    paidAmount: '',
    paymentStatus: 'ממתין לתשלום' as PaymentStatus,
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientWhatsapp: '',
    clientCompany: '',
    folderPath: '',
    tags: [] as string[],
    notes: ''
  });

  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSelectFolder = async () => {
    try {
      const selectedPath = await FolderService.selectProjectFolder();
      if (selectedPath) {
        handleInputChange('folderPath', selectedPath);
        toast({
          title: "תיקיה נבחרה",
          description: `נבחרה התיקיה: ${selectedPath}`,
        });
      } else {
        // אם לא הצלחנו לבחור תיקיה, נציג הודעה מתאימה
        const isDesktopMode = window.location.protocol === 'tauri:';
        if (!isDesktopMode) {
          toast({
            title: "דרוש Desktop Companion",
            description: "כדי לבחור תיקיות מהדפדפן, יש להתקין את Desktop Companion",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "לא ניתן לבחור תיקיה",
        variant: "destructive"
      });
    }
  };

  // Initialize form data
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // Define today here
    
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'תכנון',
        priority: project.priority || 'בינונית',
        startDate: project.startDate ? project.startDate.split('T')[0] : today,
        dueDate: project.dueDate ? project.dueDate.split('T')[0] : today,
        budget: project.budget ? project.budget.toString() : '',
        paidAmount: project.paidAmount ? project.paidAmount.toString() : '',
        paymentStatus: project.paymentStatus || 'ממתין לתשלום',
        clientId: project.client?.id || '',
        clientName: project.client?.name || '',
        clientEmail: project.client?.email || '',
        clientPhone: project.client?.phone || '',
        clientWhatsapp: project.client?.whatsapp || '',
        clientCompany: project.client?.company || '',
        folderPath: project.folderPath || '',
        tags: project.tags?.map(t => t.name) || [],
        notes: project.notes || ''
      });
    } else {
      // Set default start date to today
      setFormData({
        name: '',
        description: '',
        status: 'תכנון',
        priority: 'בינונית',
        startDate: today,
        dueDate: today,
        budget: '',
        paidAmount: '',
        paymentStatus: 'ממתין לתשלום',
        clientId: 'no-client',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientWhatsapp: '',
        clientCompany: '',
        folderPath: '',
        tags: [],
        notes: ''
      });
    }
  }, [project]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
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
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'שם הפרויקט הוא שדה חובה';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'תיאור הפרויקט הוא שדה חובה';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'תאריך התחלה הוא שדה חובה';
    }

    if (formData.dueDate && formData.startDate && 
        new Date(formData.dueDate) < new Date(formData.startDate)) {
      newErrors.dueDate = 'תאריך יעד לא יכול להיות לפני תאריך ההתחלה';
    }

    if (formData.budget && (isNaN(Number(formData.budget)) || Number(formData.budget) < 0)) {
      newErrors.budget = 'תקציב חייב להיות מספר חיובי';
    }

    if (formData.paidAmount && (isNaN(Number(formData.paidAmount)) || Number(formData.paidAmount) < 0)) {
      newErrors.paidAmount = 'סכום ששולם חייב להיות מספר חיובי';
    }

    if (formData.budget && formData.paidAmount && 
        Number(formData.paidAmount) > Number(formData.budget)) {
      newErrors.paidAmount = 'סכום ששולם לא יכול להיות גדול מהתקציב';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "שגיאות בטופס",
        description: "אנא תקן את השגיאות ונסה שוב",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedClient = formData.clientId && formData.clientId !== 'no-client'
        ? contacts.find(c => c.id === formData.clientId) 
        : undefined;

      // Create client object from form data if new client or manual entry
      const clientData = (formData.clientId === 'new-client' || (formData.clientName && formData.clientId !== 'no-client'))
        ? {
            id: selectedClient?.id || `client-${Date.now()}`,
            name: formData.clientName.trim(),
            email: formData.clientEmail.trim() || undefined,
            phone: formData.clientPhone.trim() || undefined,
            whatsapp: formData.clientWhatsapp.trim() || undefined,
            company: formData.clientCompany.trim() || undefined,
            notes: undefined
          }
        : selectedClient
          ? { 
              id: selectedClient.id, 
              name: selectedClient.name, 
              email: selectedClient.email, 
              phone: selectedClient.phone, 
              whatsapp: selectedClient.whatsapp,
              company: selectedClient.company, 
              notes: selectedClient.notes 
            }
          : undefined;

      const projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        priority: formData.priority,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        paidAmount: formData.paidAmount ? Number(formData.paidAmount) : undefined,
        paymentStatus: formData.paymentStatus,
        client: clientData,
        folderPath: formData.folderPath.trim() || undefined,
        tags: formData.tags.map(t => ({ id: `${Date.now()}-${t}`, name: t, color: '#3B82F6' })),
        notes: formData.notes.trim() || undefined
      };

      if (project) {
        const updatedProject = { 
          ...projectData, 
          id: project.id,
          createdAt: project.createdAt,
          updatedAt: new Date().toISOString()
        };
        await updateProject(updatedProject);
        onSubmit(updatedProject);
        
        toast({
          title: "פרויקט עודכן",
          description: `הפרויקט "${formData.name}" עודכן בהצלחה`,
        });
      } else {
        const newProject = await addProject(projectData);
        onSubmit(newProject);
        
        toast({
          title: "פרויקט נוסף",
          description: `הפרויקט "${formData.name}" נוסף בהצלחה`,
        });
      }
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בשמירת הפרויקט",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: string) => {
    if (!value) return '';
    const num = Number(value);
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b">
        <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
          <FolderOpen className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {project ? 'עריכת פרויקט' : 'פרויקט חדש'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {project ? 'ערוך את פרטי הפרויקט' : 'הוסף פרויקט חדש למערכת'}
          </p>
        </div>
      </div>

      {/* Basic Information */}
      <Card className="rounded-xl border border-blue-100 bg-blue-50/60 dark:bg-blue-950/20 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base text-blue-700 dark:text-blue-400">
            <FileText className="w-4 h-4" />
            מידע בסיסי
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                שם הפרויקט <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="הכנס שם פרויקט..."
                className={cn('rtl', errors.name && 'border-red-500')}
              />
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">לקוח</Label>
              <Select
                value={formData.clientId}
                onValueChange={(value) => {
                  handleInputChange('clientId', value);
                  if (value === 'no-client') {
                    handleInputChange('clientName', '');
                    handleInputChange('clientEmail', '');
                    handleInputChange('clientPhone', '');
                    handleInputChange('clientWhatsapp', '');
                    handleInputChange('clientCompany', '');
                  } else {
                    const selectedContact = contacts.find(c => c.id === value);
                    if (selectedContact) {
                      handleInputChange('clientName', selectedContact.name);
                      handleInputChange('clientEmail', selectedContact.email || '');
                      handleInputChange('clientPhone', selectedContact.phone || '');
                      handleInputChange('clientWhatsapp', selectedContact.whatsapp || '');
                      handleInputChange('clientCompany', selectedContact.company || '');
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר לקוח..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-client">ללא לקוח</SelectItem>
                  <SelectItem value="new-client">הוסף לקוח חדש</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {contact.name}
                        {contact.company && (
                          <span className="text-xs text-muted-foreground">
                            ({contact.company})
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              תיאור הפרויקט <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="תאר את הפרויקט..."
              rows={3}
              className={cn('rtl', errors.description && 'border-red-500')}
            />
            {errors.description && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>סטטוס פרויקט</Label>
              <StatusSelector
                value={formData.status}
                onChange={(status) => handleInputChange('status', status)}
              />
            </div>

            <div className="space-y-2">
              <Label>עדיפות</Label>
              <PrioritySelector
                value={formData.priority}
                onChange={(priority) => handleInputChange('priority', priority)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      {(formData.clientId === 'new-client' || (formData.clientId && formData.clientId !== 'no-client' && !contacts.find(c => c.id === formData.clientId))) && (
        <Card className="rounded-xl border border-green-100 bg-green-50/60 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <User className="w-4 h-4" />
              פרטי לקוח
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">שם לקוח</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  placeholder="הכנס שם לקוח..."
                  className="rtl"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientCompany">חברה</Label>
                <Input
                  id="clientCompany"
                  value={formData.clientCompany}
                  onChange={(e) => handleInputChange('clientCompany', e.target.value)}
                  placeholder="שם החברה..."
                  className="rtl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientEmail">אימייל</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                  placeholder="email@example.com"
                  className="ltr"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientPhone">טלפון</Label>
                <Input
                  id="clientPhone"
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                  placeholder="050-1234567"
                  className="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientWhatsapp">וואטסאפ</Label>
                <Input
                  id="clientWhatsapp"
                  type="tel"
                  value={formData.clientWhatsapp}
                  onChange={(e) => handleInputChange('clientWhatsapp', e.target.value)}
                  placeholder="050-1234567"
                  className="ltr"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dates */}
      <Card className="rounded-xl border border-blue-100 bg-blue-50/40 dark:bg-blue-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <Calendar className="w-4 h-4" />
            תאריכים
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-1">
                תאריך התחלה <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={cn(errors.startDate && 'border-red-500')}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">תאריך יעד</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className={cn(errors.dueDate && 'border-red-500')}
              />
              {errors.dueDate && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.dueDate}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card className="rounded-xl border border-blue-100 bg-blue-50/40 dark:bg-blue-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
            <DollarSign className="w-4 h-4" />
            מידע כספי
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">תקציב (₪)</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => handleInputChange('budget', e.target.value)}
                placeholder="0"
                className={cn('ltr', errors.budget && 'border-red-500')}
              />
              {errors.budget && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.budget}
                </p>
              )}
              {formData.budget && (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(formData.budget)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidAmount">סכום ששולם (₪)</Label>
              <Input
                id="paidAmount"
                type="number"
                min="0"
                max={formData.budget || undefined}
                value={formData.paidAmount}
                onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                placeholder="0"
                className={cn('ltr', errors.paidAmount && 'border-red-500')}
              />
              {errors.paidAmount && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.paidAmount}
                </p>
              )}
              {formData.paidAmount && (
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(formData.paidAmount)}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>סטטוס תשלום</Label>
              <Select
                value={formData.paymentStatus}
                onValueChange={(value) => handleInputChange('paymentStatus', value as PaymentStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ממתין לתשלום">ממתין לתשלום</SelectItem>
                  <SelectItem value="שולם חלקית">שולם חלקית</SelectItem>
                  <SelectItem value="שולם במלואו">שולם במלואו</SelectItem>
                  <SelectItem value="לא רלוונטי">לא רלוונטי</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Payment Summary */}
          {formData.budget && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">תקציב:</span>
                  <p className="font-medium">{formatCurrency(formData.budget)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">שולם:</span>
                  <p className="font-medium text-green-600">
                    {formatCurrency(formData.paidAmount || '0')}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">נותר:</span>
                  <p className="font-medium text-orange-600">
                    {formatCurrency(
                      (Number(formData.budget) - Number(formData.paidAmount || 0)).toString()
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="rounded-xl border bg-muted/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            מידע נוסף
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folderPath" className="flex items-center gap-1">
              <FolderOpen className="w-4 h-4" />
              נתיב תיקייה
            </Label>
            <div className="flex gap-2">
              <Input
                id="folderPath"
                value={formData.folderPath}
                onChange={(e) => handleInputChange('folderPath', e.target.value)}
                placeholder="C:\Projects\ProjectName"
                dir="ltr"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleSelectFolder}
                className="shrink-0 px-3"
              >
                <FolderOpen className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Building className="w-4 h-4" />
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

          <div className="space-y-2">
            <Label htmlFor="notes">הערות</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="הערות נוספות על הפרויקט..."
              rows={4}
              className="rtl"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          ביטול
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.name.trim() || !formData.description.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? 'שומר...' : project ? 'שמור שינויים' : 'צור פרויקט'}
        </Button>
      </div>
    </div>
  );
}
