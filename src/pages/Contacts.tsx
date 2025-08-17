import { useState } from 'react';
import { Plus, Search, Download, Edit, Trash2, Mail, Phone, MessageCircle } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Contact } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContactDialog } from '@/components/ContactDialog';
import { 
  isTauriEnvironment, 
  openWhatsApp, 
  openMail, 
  openPhone, 
  exportFileNative
} from '@/lib/tauri';

export function Contacts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  const {
    contacts,
    projects,
    deleteContact,
    exportToCSV,
  } = useProjectStore();

  const filteredContacts = contacts.filter((contact) => {
    return (
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contact.phone && contact.phone.includes(searchTerm))
    );
  });

  const handleDelete = (id: string) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את איש הקשר?')) {
      deleteContact(id);
    }
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setIsDialogOpen(true);
  };

  const handleExport = async () => {
    try {
      const content = exportToCSV('contacts');
      
      if (isTauriEnvironment()) {
        await exportFileNative(content, 'contacts.csv', 'csv');
      } else {
        const blob = new Blob([content], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'contacts.csv';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting contacts:', error);
    }
  };

  const handleEmailClick = async (email: string) => {
    try {
      await openMail(email);
    } catch (error) {
      console.error('Error opening email:', error);
    }
  };

  const handlePhoneClick = async (phone: string) => {
    try {
      await openPhone(phone);
    } catch (error) {
      console.error('Error opening phone:', error);
    }
  };

  const handleWhatsAppClick = async (phone: string) => {
    try {
      await openWhatsApp(phone);
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">אנשי קשר</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExport}
            className="gap-2"
          >
            <Download size={16} />
            יצוא CSV
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus size={16} />
            איש קשר חדש
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          placeholder="חיפוש אנשי קשר..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Contacts Grid */}
      {filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            {searchTerm ? 'לא נמצאו אנשי קשר' : 'אין אנשי קשר עדיין'}
          </h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'נסה לשנות את מילות החיפוש' : 'התחל להוסיף אנשי קשר לפרויקטים שלך'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate">
                      {contact.name}
                    </CardTitle>
                    {contact.email && (
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {contact.email}
                      </p>
                    )}
                    {contact.phone && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {contact.phone}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* פרויקטים קשורים */}
                {contact.projectIds && contact.projectIds.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">פרויקטים:</p>
                    <div className="flex flex-wrap gap-1">
                      {contact.projectIds.map((projectId) => {
                        const project = projects.find(p => p.id === projectId);
                        return project ? (
                          <Badge key={projectId} variant="secondary" className="text-xs">
                            {project.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* כפתורי תקשורת */}
                <div className="flex items-center gap-2 mb-4">
                  {contact.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmailClick(contact.email!)}
                      className="gap-2 flex-1"
                    >
                      <Mail className="w-4 h-4" />
                      אימייל
                    </Button>
                  )}
                  {contact.phone && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePhoneClick(contact.phone!)}
                        className="gap-2 flex-1"
                      >
                        <Phone className="w-4 h-4" />
                        חייג
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWhatsAppClick(contact.phone!)}
                        className="gap-2 flex-1 bg-green-50 hover:bg-green-100 border-green-200 text-green-700"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </Button>
                    </>
                  )}
                </div>

                {/* כפתורי פעולה */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(contact)}
                    className="gap-2 flex-1"
                  >
                    <Edit className="w-4 h-4" />
                    עריכה
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(contact.id)}
                    className="gap-2 flex-1 hover:bg-red-50 hover:border-red-200 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                    מחיקה
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contact Dialog */}
      <ContactDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingContact(null);
        }}
        contact={editingContact}
        projects={projects}
      />
    </div>
  );
}
