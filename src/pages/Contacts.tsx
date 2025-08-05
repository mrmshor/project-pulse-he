import { useState } from 'react';
import { Plus, Search, Download, Edit, Trash2, Mail, Phone, MessageCircle } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Contact } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ContactDialog } from '@/components/ContactDialog';

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

  const handleExport = () => {
    const content = exportToCSV('contacts');
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contacts.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatPhone = (phone: string) => {
    // Convert Israeli phone format for WhatsApp (remove dashes, add country code)
    return phone.replace(/[^0-9]/g, '').replace(/^0/, '972');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">אנשי קשר</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download size={16} />
            CSV
          </Button>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus size={16} />
            איש קשר חדש
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="חיפוש אנשי קשר..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact) => {
          const contactProjects = contact.projectIds
            .map((id) => projects.find((p) => p.id === id))
            .filter(Boolean);
          
          return (
            <Card key={contact.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{contact.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contact.id)}
                      className="text-danger hover:text-danger"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail size={16} className="text-muted-foreground" />
                      <span>{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone size={16} className="text-muted-foreground" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {contact.email && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`mailto:${contact.email}`)}
                      className="gap-1"
                    >
                      <Mail size={14} />
                      אימייל
                    </Button>
                  )}
                  {contact.phone && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`tel:${contact.phone}`)}
                        className="gap-1"
                      >
                        <Phone size={14} />
                        התקשר
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => 
                          window.open(`https://wa.me/${formatPhone(contact.phone)}`)
                        }
                        className="gap-1"
                      >
                        <MessageCircle size={14} />
                        WhatsApp
                      </Button>
                    </>
                  )}
                </div>

                {/* Projects */}
                {contactProjects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">פרויקטים:</h4>
                    <div className="flex flex-wrap gap-1">
                      {contactProjects.map((project) => (
                        <Badge key={project!.id} variant="secondary" className="text-xs">
                          {project!.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">לא נמצאו אנשי קשר</p>
        </div>
      )}

      <ContactDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditingContact(null);
        }}
        contact={editingContact}
      />
    </div>
  );
}