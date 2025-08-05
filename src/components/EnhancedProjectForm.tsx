import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { FolderService, ClientContactService } from '@/services/nativeServices';
import { Project } from '@/types';
import { useProjectStore } from '@/store/useProjectStore';
import { 
  FolderOpen, 
  Phone, 
  Mail, 
  MessageCircle, 
  User, 
  Building,
  Loader2,
  Check,
  X,
  CreditCard,
  DollarSign
} from 'lucide-react';

interface ClientFormData {
  name: string;
  whatsapp: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

interface EnhancedProjectFormProps {
  project?: Project;
  onSave: () => void;
  onCancel: () => void;
}

export function EnhancedProjectForm({ project, onSave, onCancel }: EnhancedProjectFormProps) {
  const { addProject, updateProject } = useProjectStore();
  // נתוני הטופס הקיימים
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'תכנון',
    priority: project?.priority || 'בינונית',
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    dueDate: project?.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
  });

  // נתונים חדשים - תיקיה ולקוח
  const [folderPath, setFolderPath] = useState(project?.folderPath || '');
  const [client, setClient] = useState<ClientFormData>({
    name: project?.client?.name || '',
    whatsapp: project?.client?.whatsapp || '',
    email: project?.client?.email || '',
    phone: project?.client?.phone || '',
    company: project?.client?.company || '',
    notes: project?.client?.notes || ''
  });
  
  // נתוני תשלום
  const [payment, setPayment] = useState({
    amount: project?.payment?.amount || '',
    currency: project?.payment?.currency || 'ILS',
    isPaid: project?.payment?.isPaid || false,
    notes: project?.payment?.notes || ''
  });
  
  const [isSelectingFolder, setIsSelectingFolder] = useState(false);
  const [validations, setValidations] = useState({
    phone: true,
    whatsapp: true,
    email: true
  });

  // ולידציה בזמן אמת
  useEffect(() => {
    setValidations({
      phone: !client.phone || ClientContactService.validateIsraeliPhone(client.phone),
      whatsapp: !client.whatsapp || ClientContactService.validateIsraeliPhone(client.whatsapp),
      email: !client.email || ClientContactService.validateEmail(client.email)
    });
  }, [client.phone, client.whatsapp, client.email]);

  // בחירת תיקיה
  const handleSelectFolder = async () => {
    setIsSelectingFolder(true);
    try {
      const selectedPath = await FolderService.selectProjectFolder();
      if (selectedPath) {
        setFolderPath(selectedPath);
      }
    } catch (error) {
      console.error('שגיאה בבחירת תיקיה:', error);
      alert('שגיאה בבחירת תיקיה');
    } finally {
      setIsSelectingFolder(false);
    }
  };

  // בדיקת תיקיה קיימת
  const handleValidateFolder = async () => {
    if (folderPath) {
      const isValid = await FolderService.validateFolderPath(folderPath);
      if (!isValid) {
        alert('התיקיה לא נמצאה. אנא בחר תיקיה חדשה.');
      } else {
        alert('התיקיה קיימת ותקינה!');
      }
    }
  };

  // שמירת פרויקט עם הנתונים החדשים
  const handleSave = () => {
    // ולידציה
    if (!formData.name.trim()) {
      alert('יש להזין שם פרויקט');
      return;
    }

    if (!client.name.trim()) {
      alert('יש להזין שם לקוח');
      return;
    }

    if (!validations.phone || !validations.whatsapp || !validations.email) {
      alert('יש לתקן את השגיאות בטופס');
      return;
    }

    const projectData = {
      name: formData.name,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      startDate: new Date(formData.startDate),
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      folderPath: folderPath || undefined,
      client: client,
      payment: {
        amount: payment.amount ? Number(payment.amount) : undefined,
        currency: payment.currency as 'ILS' | 'USD' | 'EUR',
        isPaid: payment.isPaid,
        paidDate: payment.isPaid ? (project?.payment?.paidDate || new Date()) : undefined,
        notes: payment.notes || undefined
      },
      tags: project?.tags || [],
      reminders: project?.reminders || []
    };
    
    if (project) {
      // עריכת פרויקט קיים
      updateProject(project.id, projectData);
    } else {
      // יצירת פרויקט חדש
      addProject(projectData);
    }
    
    onSave();
  };

  const handleClientChange = (field: keyof ClientFormData, value: string) => {
    setClient(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: string, value: string | boolean) => {
    setPayment(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* כותרת */}
      <div>
        <h2 className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
          {project ? 'עריכת פרויקט' : 'פרויקט חדש'}
        </h2>
        <p className="text-muted-foreground">מלא את פרטי הפרויקט והלקוח</p>
      </div>

      {/* פרטי פרויקט בסיסיים */}
      <Card className="card-macos">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            פרטי פרויקט
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">שם הפרויקט *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="הזן שם הפרויקט"
                className="input-glass"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">סטטוס</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="input-glass w-full"
              >
                <option value="תכנון">תכנון</option>
                <option value="פעיל">פעיל</option>
                <option value="הושלם">הושלם</option>
                <option value="בהמתנה">בהמתנה</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">עדיפות</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                className="input-glass w-full"
              >
                <option value="נמוכה">נמוכה</option>
                <option value="בינונית">בינונית</option>
                <option value="גבוהה">גבוהה</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">תאריך יעד</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="input-glass"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">תיאור</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="תאר את הפרויקט..."
              className="input-glass"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* תיקיית פרויקט */}
      <Card className="card-macos">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            תיקיית פרויקט
          </CardTitle>
        </CardHeader>
        <CardContent>
          {folderPath ? (
            <div className="glass p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FolderOpen className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="truncate text-sm">{folderPath}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => FolderService.openInFinder(folderPath)}
                    size="sm"
                    variant="outline"
                  >
                    פתח
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSelectFolder}
                    size="sm"
                    variant="outline"
                  >
                    שנה
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setFolderPath('')}
                    size="sm"
                    variant="destructive"
                  >
                    הסר
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleSelectFolder}
              disabled={isSelectingFolder}
              variant="outline"
              className="w-full gap-2 h-16 border-dashed"
            >
              {isSelectingFolder ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FolderOpen className="w-5 h-5" />
              )}
              {isSelectingFolder ? 'בוחר תיקיה...' : 'בחר תיקיית פרויקט'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* פרטי לקוח */}
      <Card className="card-macos">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            פרטי לקוח
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                שם הלקוח *
              </label>
              <Input
                value={client.name}
                onChange={(e) => handleClientChange('name', e.target.value)}
                placeholder="שם מלא של הלקוח"
                className="input-glass"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Building className="w-4 h-4" />
                חברה
              </label>
              <Input
                value={client.company}
                onChange={(e) => handleClientChange('company', e.target.value)}
                placeholder="שם החברה"
                className="input-glass"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Phone className="w-4 h-4" />
                טלפון
                {client.phone && (
                  validations.phone ? 
                    <Check className="w-4 h-4 text-green-600" /> : 
                    <X className="w-4 h-4 text-red-600" />
                )}
              </label>
              <Input
                type="tel"
                value={client.phone}
                onChange={(e) => handleClientChange('phone', e.target.value)}
                placeholder="05X-XXXXXXX"
                className={`input-glass ${!validations.phone ? 'border-red-300' : ''}`}
              />
              {!validations.phone && (
                <span className="text-red-600 text-xs">פורמט מספר טלפון לא תקין</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
                {client.whatsapp && (
                  validations.whatsapp ? 
                    <Check className="w-4 h-4 text-green-600" /> : 
                    <X className="w-4 h-4 text-red-600" />
                )}
              </label>
              <Input
                type="tel"
                value={client.whatsapp}
                onChange={(e) => handleClientChange('whatsapp', e.target.value)}
                placeholder="05X-XXXXXXX"
                className={`input-glass ${!validations.whatsapp ? 'border-red-300' : ''}`}
              />
              {!validations.whatsapp && (
                <span className="text-red-600 text-xs">פורמט מספר טלפון לא תקין</span>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Mail className="w-4 h-4" />
                אימייל
                {client.email && (
                  validations.email ? 
                    <Check className="w-4 h-4 text-green-600" /> : 
                    <X className="w-4 h-4 text-red-600" />
                )}
              </label>
              <Input
                type="email"
                value={client.email}
                onChange={(e) => handleClientChange('email', e.target.value)}
                placeholder="client@example.com"
                className={`input-glass ${!validations.email ? 'border-red-300' : ''}`}
              />
              {!validations.email && (
                <span className="text-red-600 text-xs">כתובת אימייל לא תקינה</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">הערות</label>
            <Textarea
              value={client.notes}
              onChange={(e) => handleClientChange('notes', e.target.value)}
              placeholder="הערות נוספות על הלקוח..."
              className="input-glass"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* פרטי תשלום */}
      <Card className="card-macos">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            פרטי תשלום
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="w-4 h-4" />
                סכום
              </label>
              <Input
                type="number"
                value={payment.amount}
                onChange={(e) => handlePaymentChange('amount', e.target.value)}
                placeholder="0"
                className="input-glass"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">מטבע</label>
              <select
                value={payment.currency}
                onChange={(e) => handlePaymentChange('currency', e.target.value)}
                className="input-glass w-full"
              >
                <option value="ILS">שקל (₪)</option>
                <option value="USD">דולר ($)</option>
                <option value="EUR">יורו (€)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPaid"
              checked={payment.isPaid}
              onCheckedChange={(checked) => handlePaymentChange('isPaid', checked === true)}
            />
            <label htmlFor="isPaid" className="text-sm font-medium cursor-pointer">
              התקבל תשלום
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">הערות תשלום</label>
            <Textarea
              value={payment.notes}
              onChange={(e) => handlePaymentChange('notes', e.target.value)}
              placeholder="הערות על התשלום..."
              className="input-glass"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* כפתורי פעולה */}
      <div className="flex gap-4 justify-end">
        <Button type="button" onClick={onCancel} variant="outline">
          ביטול
        </Button>
        <Button type="button" onClick={handleSave} className="btn-gradient">
          שמור פרויקט
        </Button>
      </div>
    </div>
  );
}