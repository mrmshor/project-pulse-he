import { useState, type ChangeEvent } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { Project, ProjectStatus, Priority } from '@/types';
import { Button } from '@/components/ui/button';
import { EnhancedProjectForm } from '@/components/EnhancedProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { isTauriEnvironment, exportFileNative } from '@/lib/tauri';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Users, Plus, Download, DollarSign, CheckCircle, Calendar, TrendingUp, Clock, Search } from 'lucide-react';

export function Projects() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const {
    projects,
    updateProject,
    exportToCSV,
    exportToJSON,
  } = useProjectStore();

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || project.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  const handleSubmit = (project: Project) => {
    if (editingProject) {
      updateProject(project);
    } else {
      // addProject will be handled by the form
    }
    setIsDialogOpen(false);
    setEditingProject(null);
  };

  const activeProjects = projects.filter(p => p.status === 'פעיל').length;
  const completedProjects = projects.filter(p => p.status === 'הושלם').length;
  const completionRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;
  const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalContacts = projects.filter(p => p.client).length;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Main Title */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl">✨</span>
              </div>
              <h1 className="text-4xl font-bold text-blue-600">
                מערכת ניהול פרויקטים Pro
              </h1>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="outline"
                className="gap-2 bg-white border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Users className="w-4 h-4" />
                פרויקטים מתקדם
              </Button>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6"
              >
                <Plus className="w-4 h-4" />
                לוח בקרה Pro
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                className="gap-2 bg-white border-gray-200 hover:bg-gray-50"
              >
                <Download className="w-4 h-4" />
                ייצוא CSV
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Card 1 - Total Projects */}
            <div className="lg:col-span-2 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-green-100 text-sm font-medium">סה"כ הכנסות</span>
                </div>
                <div className="text-3xl font-bold mb-1">₪{totalRevenue.toLocaleString()}</div>
                <div className="text-green-100 text-sm">הכנסות ששולמו</div>
              </div>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
            </div>

            {/* Card 2 - Completed Projects */}
            <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-green-100 text-sm font-medium">פרויקטים שהושלמו</span>
                </div>
                <div className="text-3xl font-bold mb-1">{completedProjects}</div>
                <div className="text-green-100 text-sm">{completionRate}% מהפרויקטים</div>
              </div>
            </div>

            {/* Card 3 - Total Projects */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-blue-100 text-sm font-medium">סה"כ פרויקטים</span>
                </div>
                <div className="text-3xl font-bold mb-1">{projects.length}</div>
                <div className="text-blue-100 text-sm">{activeProjects} בביצוע</div>
              </div>
            </div>

            {/* Card 4 - Active Clients */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5" />
                  <span className="text-purple-100 text-sm font-medium">לקוחות פעילים</span>
                </div>
                <div className="text-3xl font-bold mb-1">{totalContacts}</div>
                <div className="text-purple-100 text-sm">לקוחות ייחודיים</div>
              </div>
            </div>

            {/* Card 5 - Payment Rate */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-red-100 text-sm font-medium">אחוז תשלומים</span>
                </div>
                <div className="text-3xl font-bold mb-1">0.0%</div>
                <div className="text-red-100 text-sm">0 מתוך {projects.length} שולמו</div>
              </div>
            </div>

            {/* Card 6 - Pending Revenue */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="text-orange-100 text-sm font-medium">הכנסות ממתינות</span>
                </div>
                <div className="text-3xl font-bold mb-1">₪{totalRevenue.toLocaleString()}</div>
                <div className="text-orange-100 text-sm">מ-{projects.length} פרויקטים</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Projects */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">פרויקטים אחרונים</h2>
              <span className="text-gray-500">{projects.length} פרויקטים</span>
            </div>

            <div className="space-y-4">
              {filteredProjects.slice(0, 10).map((project) => (
                <Card key={project.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-2 h-12 bg-orange-400 rounded-full"></div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{project.client?.name || 'ללא לקוח'}</span>
                            <span>•</span>
                            <span>₪{(project.budget || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={project.status === 'פעיל' ? 'default' : 'secondary'}
                          className={
                            project.status === 'פעיל' ? 'bg-blue-100 text-blue-700' :
                            project.status === 'הושלם' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }
                        >
                          {project.status}
                        </Badge>
                        <Badge 
                          variant="outline"
                          className={
                            project.priority === 'גבוהה' ? 'border-red-200 text-red-600' :
                            project.priority === 'בינונית' ? 'border-orange-200 text-orange-600' :
                            'border-green-200 text-green-600'
                          }
                        >
                          {project.priority}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">פעולות מהירות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  פרויקט חדש
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleExport('csv')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  ייצוא נתונים
                </Button>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">סינון</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="חיפוש פרויקטים..."
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as ProjectStatus | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסטטוסים</SelectItem>
                    <SelectItem value="תכנון">תכנון</SelectItem>
                    <SelectItem value="פעיל">פעיל</SelectItem>
                    <SelectItem value="הושלם">הושלם</SelectItem>
                    <SelectItem value="מושהה">מושהה</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={priorityFilter} onValueChange={(value: string) => setPriorityFilter(value as Priority | 'all')}>
                  <SelectTrigger>
                    <SelectValue placeholder="עדיפות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל העדיפויות</SelectItem>
                    <SelectItem value="נמוכה">נמוכה</SelectItem>
                    <SelectItem value="בינונית">בינונית</SelectItem>
                    <SelectItem value="גבוהה">גבוהה</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog for Project Form */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          setEditingProject(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? 'עריכת פרויקט' : 'פרויקט חדש'}
            </DialogTitle>
          </DialogHeader>
          <EnhancedProjectForm
            project={editingProject}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingProject(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}