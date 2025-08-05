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
  DollarSign,
  Plus,
  Trash2
} from 'lucide-react';

interface ClientFormData {
  name: string;
  whatsappNumbers: {
    id: string;
    number: string;
    label: string;
    isPrimary: boolean;
  }[];
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
    whatsappNumbers: project?.client?.whatsappNumbers || [
      { id: '1', number: '', label: 'אישי', isPrimary: true }
    ],
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
    whatsappNumbers: client.whatsappNumbers.map(() => true),
    email: true
  });

  // ולידציה בזמן אמת
  useEffect(() => {
    setValidations({
      phone: !client.phone || ClientContactService.validateIsraeliPhone(client.phone),
      whatsappNumbers: client.whatsappNumbers.map(whatsapp => 
        !whatsapp.number || ClientContactService.validateIsraeliPhone(whatsapp.number)
      ),
      email: !client.email || ClientContactService.validateEmail(client.email)
    });
  }, [client.phone, client.whatsappNumbers, client.email]);

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

    if (!validations.phone || !validations.whatsappNumbers.every(v => v) || !validations.email) {
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

  const handleClientChange = (field: keyof ClientFormData, value: string | ClientFormData['whatsappNumbers']) => {
    setClient(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: string, value: string | boolean) => {
    setPayment(prev => ({ ...prev, [field]: value }));
  };

  // פונקציות עבור וואטסאפ מרובה
  const addWhatsAppNumber = () => {
    const newId = Date.now().toString();
    setClient(prev => ({
      ...prev,
      whatsappNumbers: [
        ...prev.whatsappNumbers,
        { id: newId, number: '', label: 'נוסף', isPrimary: false }
      ]
    }));
  };

  const removeWhatsAppNumber = (id: string) => {
    setClient(prev => ({
      ...prev,
      whatsappNumbers: prev.whatsappNumbers.filter(w => w.id !== id)
    }));
  };

  const updateWhatsAppNumber = (id: string, field: 'number' | 'label' | 'isPrimary', value: string | boolean) => {
    setClient(prev => ({
      ...prev,
      whatsappNumbers: prev.whatsappNumbers.map(w => 
        w.id === id 
          ? { 
              ...w, 
              [field]: value,
              // אם מסמן כראשי, צריך לבטל את הראשי הקודם
              ...(field === 'isPrimary' && value === true 
                ? { isPrimary: true }
                : field === 'isPrimary' && value === false
                ? { isPrimary: false }
                : {}
              )
            }
          : field === 'isPrimary' && value === true 
            ? { ...w, isPrimary: false }
            : w
      )
    }));
  };

  return (
    <div className="space-y-6 p-1">
      {/* כותרת מעוצבת */}
      <div className="text-center pb-6">
        <div className="relative">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight mb-2">
            {project ? 'עריכת פרויקט' : 'פרויקט חדש'}
          </h2>
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full"></div>
        </div>
        <p className="text-muted-foreground mt-3">מלא את פרטי הפרויקט והלקוח</p>
      </div>

      {/* פרטי פרויקט בסיסיים */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FolderOpen className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">פרטי פרויקט</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">שם הפרויקט *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="הזן שם הפרויקט"
                className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">סטטוס</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="תכנון">תכנון</option>
                <option value="פעיל">פעיל</option>
                <option value="הושלם">הושלם</option>
                <option value="בהמתנה">בהמתנה</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">עדיפות</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="נמוכה">נמוכה</option>
                <option value="בינונית">בינונית</option>
                <option value="גבוהה">גבוהה</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">תאריך יעד</label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">תיאור</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="תאר את הפרויקט..."
              className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* תיקיית פרויקט */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FolderOpen className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">תיקיית פרויקט</h3>
          </div>
        </div>
        <div className="p-6">
          {folderPath ? (
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FolderOpen className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span className="truncate text-sm font-medium">{folderPath}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => FolderService.openInFinder(folderPath)}
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    פתח
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSelectFolder}
                    size="sm"
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
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
              className="w-full gap-2 h-16 border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              {isSelectingFolder ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FolderOpen className="w-5 h-5" />
              )}
              {isSelectingFolder ? 'בוחר תיקיה...' : 'בחר תיקיית פרויקט'}
            </Button>
          )}
        </div>
      </div>

      {/* פרטי לקוח */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">פרטי לקוח</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <User className="w-4 h-4" />
                שם הלקוח *
              </label>
              <Input
                value={client.name}
                onChange={(e) => handleClientChange('name', e.target.value)}
                placeholder="שם מלא של הלקוח"
                className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Building className="w-4 h-4" />
                חברה
              </label>
              <Input
                value={client.company}
                onChange={(e) => handleClientChange('company', e.target.value)}
                placeholder="שם החברה"
                className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                className={`bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary ${!validations.phone ? 'border-red-300' : ''}`}
              />
              {!validations.phone && (
                <span className="text-red-600 text-xs">פורמט מספר טלפון לא תקין</span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <MessageCircle className="w-4 h-4" />
                  מספרי WhatsApp
                </label>
                <Button
                  type="button"
                  onClick={addWhatsAppNumber}
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                >
                  <Plus size={14} />
                  הוסף מספר
                </Button>
              </div>
              
              <div className="space-y-3">
                {client.whatsappNumbers.map((whatsapp, index) => (
                  <div key={whatsapp.id} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="tel"
                          value={whatsapp.number}
                          onChange={(e) => updateWhatsAppNumber(whatsapp.id, 'number', e.target.value)}
                          placeholder="05X-XXXXXXX"
                          className={`flex-1 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary ${!validations.whatsappNumbers[index] ? 'border-red-300' : ''}`}
                        />
                        <Input
                          value={whatsapp.label}
                          onChange={(e) => updateWhatsAppNumber(whatsapp.id, 'label', e.target.value)}
                          placeholder="תווית"
                          className="w-20 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary text-xs"
                        />
                        <div className="flex items-center gap-1">
                          <input
                            type="radio"
                            checked={whatsapp.isPrimary}
                            onChange={(e) => updateWhatsAppNumber(whatsapp.id, 'isPrimary', e.target.checked)}
                            className="w-4 h-4"
                            title="ראשי"
                          />
                          {client.whatsappNumbers.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removeWhatsAppNumber(whatsapp.id)}
                              size="sm"
                              variant="ghost"
                              className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </div>
                      {!validations.whatsappNumbers[index] && (
                        <span className="text-red-600 text-xs">פורמט מספר טלפון לא תקין</span>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {whatsapp.number && validations.whatsappNumbers[index] && (
                          <Check className="w-3 h-3 text-green-600" />
                        )}
                        {whatsapp.isPrimary && (
                          <span className="text-primary font-medium">ראשי</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
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
                className={`bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary ${!validations.email ? 'border-red-300' : ''}`}
              />
              {!validations.email && (
                <span className="text-red-600 text-xs">כתובת אימייל לא תקינה</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">הערות</label>
            <Textarea
              value={client.notes}
              onChange={(e) => handleClientChange('notes', e.target.value)}
              placeholder="הערות נוספות על הלקוח..."
              className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* פרטי תשלום */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">פרטי תשלום</h3>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <DollarSign className="w-4 h-4" />
                סכום
              </label>
              <Input
                type="number"
                value={payment.amount}
                onChange={(e) => handlePaymentChange('amount', e.target.value)}
                placeholder="0"
                className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">מטבע</label>
              <select
                value={payment.currency}
                onChange={(e) => handlePaymentChange('currency', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary"
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
            <label htmlFor="isPaid" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
              התקבל תשלום
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">הערות תשלום</label>
            <Textarea
              value={payment.notes}
              onChange={(e) => handlePaymentChange('notes', e.target.value)}
              placeholder="הערות על התשלום..."
              className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 focus:border-primary"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* כפתורי פעולה */}
      <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          onClick={handleSave}
          className="flex-1 bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          size="lg"
        >
          {project ? 'עדכן פרויקט' : 'צור פרויקט'}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          size="lg"
        >
          ביטול
        </Button>
      </div>
    </div>
  );
}