import { FixedSizeList as List } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, Task, Contact } from '@/types';
import { Calendar, User, CheckCircle, Clock } from 'lucide-react';

interface VirtualizedProjectListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
}

interface VirtualizedTaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

interface VirtualizedContactListProps {
  contacts: Contact[];
  onContactClick?: (contact: Contact) => void;
}

// Project List Item Component
const ProjectItem = ({ index, style, data }: { index: number; style: any; data: { projects: Project[]; onProjectClick?: (project: Project) => void } }) => {
  const project = data.projects[index];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'הושלם': return 'bg-green-100 text-green-800';
      case 'פעיל': return 'bg-blue-100 text-blue-800';
      case 'תכנון': return 'bg-yellow-100 text-yellow-800';
      case 'בהמתנה': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'גבוהה': return 'bg-red-100 text-red-800';
      case 'בינונית': return 'bg-orange-100 text-orange-800';
      case 'נמוכה': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div style={style} className="px-2 py-1">
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => project && data.onProjectClick?.(project)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {project.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>יעד: {project.dueDate ? new Date(project.dueDate).toLocaleDateString('he-IL') : 'לא נקבע'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(project.priority)}>
                {project.priority}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Task List Item Component
const TaskItem = ({ index, style, data }: { index: number; style: any; data: { tasks: Task[]; onTaskClick?: (task: Task) => void } }) => {
  const task = data.tasks[index];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'הושלמה': return 'bg-green-100 text-green-800';
      case 'בתהליך': return 'bg-blue-100 text-blue-800';
      case 'לביצוע': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'גבוהה': return 'bg-red-100 text-red-800';
      case 'בינונית': return 'bg-orange-100 text-orange-800';
      case 'נמוכה': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div style={style} className="px-2 py-1">
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => data.onTaskClick?.(task)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                {task.status === 'הושלמה' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{task.title}</h4>
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString('he-IL')}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Contact List Item Component
const ContactItem = ({ index, style, data }: { index: number; style: any; data: { contacts: Contact[]; onContactClick?: (contact: Contact) => void } }) => {
  const contact = data.contacts[index];

  return (
    <div style={style} className="px-2 py-1">
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => contact && data.onContactClick?.(contact)}
      >
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium">{contact?.name}</h4>
                <div className="text-xs text-muted-foreground">
                  {contact?.email && <div>{contact.email}</div>}
                  {contact?.phone && <div>{contact.phone}</div>}
                </div>
              </div>
            </div>
            <Badge variant="outline">
              {contact?.projectIds?.length || 0} פרויקטים
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Virtualized Lists
export function VirtualizedProjectList({ projects, onProjectClick }: VirtualizedProjectListProps) {
  return (
    <List
      height={600}
      itemCount={projects.length}
      itemSize={140}
      itemData={{ projects, onProjectClick }}
      width="100%"
      style={{ direction: 'rtl' }}
    >
      {ProjectItem}
    </List>
  );
}

export function VirtualizedTaskList({ tasks, onTaskClick }: VirtualizedTaskListProps) {
  return (
    <List
      height={600}
      itemCount={tasks.length}
      itemSize={80}
      itemData={{ tasks, onTaskClick }}
      width="100%"
      style={{ direction: 'rtl' }}
    >
      {TaskItem}
    </List>
  );
}

export function VirtualizedContactList({ contacts, onContactClick }: VirtualizedContactListProps) {
  return (
    <List
      height={600}
      itemCount={contacts.length}
      itemSize={90}
      itemData={{ contacts, onContactClick }}
      width="100%"
      style={{ direction: 'rtl' }}
    >
      {ContactItem}
    </List>
  );
}