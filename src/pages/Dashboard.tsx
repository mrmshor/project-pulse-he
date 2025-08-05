import { FolderOpen, CheckSquare, TrendingUp, Activity, Clock, Target, BarChart3, Calendar, Users, AlertCircle } from 'lucide-react';
import { useProjectStore, useProjectStats } from '@/store/useProjectStore';
import { usePersonalTasksStore } from '@/store/usePersonalTasksStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AdvancedDashboard } from '@/components/AdvancedDashboard';
import { format, subDays, isAfter, startOfWeek, endOfWeek } from 'date-fns';
import { he } from 'date-fns/locale';

export function Dashboard() {
  const stats = useProjectStats();
  const projects = useProjectStore((state) => state.projects);
  const tasks = useProjectStore((state) => state.tasks);
  const { tasks: personalTasks } = usePersonalTasksStore();

  // חישובי סטטיסטיקות מתקדמות
  const totalTasks = tasks.length + personalTasks.length;
  const completedTasks = tasks.filter(t => t.status === 'הושלמה').length + personalTasks.filter(t => t.completed).length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // משימות חשובות (עדיפות גבוהה)
  const urgentTasks = [
    ...tasks.filter(t => t.status !== 'הושלמה' && t.priority === 'גבוהה'),
    ...personalTasks.filter(t => !t.completed && t.priority === 'גבוהה')
  ];
  
  // משימות שמסתיימות השבוע
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
  const duingWeek = tasks.filter(t => 
    t.dueDate && 
    t.status !== 'הושלמה' &&
    new Date(t.dueDate) >= weekStart && 
    new Date(t.dueDate) <= weekEnd
  ).length;

  // פרויקטים פעילים
  const activeProjects = projects.filter(p => p.status === 'פעיל');
  const projectsProgress = projects.length > 0 ? (activeProjects.length / projects.length) * 100 : 0;

  const statCards = [
    {
      title: 'סה"כ פרויקטים',
      value: projects.length,
      subValue: `${activeProjects.length} פעילים`,
      icon: FolderOpen,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      progress: projectsProgress,
    },
    {
      title: 'שיעור השלמה',
      value: `${Math.round(completionRate)}%`,
      subValue: `${completedTasks} מתוך ${totalTasks}`,
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      progress: completionRate,
    },
    {
      title: 'משימות דחופות',
      value: urgentTasks.length,
      subValue: 'עדיפות גבוהה',
      icon: AlertCircle,
      color: 'from-red-500 to-pink-500',
      bgColor: 'from-red-50 to-pink-50',
      progress: urgentTasks.length > 0 ? 100 : 0,
      alert: urgentTasks.length > 0,
    },
    {
      title: 'השבוע',
      value: duingWeek,
      subValue: 'משימות לסיום',
      icon: Calendar,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50',
      progress: duingWeek > 0 ? 75 : 0,
    },
  ];

  // פרויקטים אחרונים עם יותר פרטים
  const recentProjects = projects
    .sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime())
    .slice(0, 3);

  // משימות פעילות עם יותר פרטים
  const recentTasks = [...tasks.filter(task => task.status !== 'הושלמה'), ...personalTasks.filter(t => !t.completed)]
    .sort((a, b) => {
      const aPriority = a.priority === 'גבוהה' ? 3 : a.priority === 'בינונית' ? 2 : 1;
      const bPriority = b.priority === 'גבוהה' ? 3 : b.priority === 'בינונית' ? 2 : 1;
      return bPriority - aPriority;
    })
    .slice(0, 5);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'תכנון':
        return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-200';
      case 'פעיל':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200';
      case 'הושלם':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'בהמתנה':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
      case 'לביצוע':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200';
      case 'בתהליך':
        return 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-indigo-200';
      case 'הושלמה':
        return 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'נמוכה':
        return 'text-green-600 bg-green-100 border border-green-200';
      case 'בינונית':
        return 'text-amber-600 bg-amber-100 border border-amber-200';
      case 'גבוהה':
        return 'text-red-600 bg-red-100 border border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border border-gray-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" dir="rtl">
      {/* כותרת מעוצבת */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-blue-50 to-cyan-50 p-8 border border-primary/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                לוח בקרה ראשי
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                סקירה כללית של כל הפעילות שלך • {format(new Date(), 'EEEE, dd MMMM yyyy', { locale: he })}
              </p>
            </div>
          </div>
          
          {/* נתון מהיר */}
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">מערכת פעילה</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">התקדמות: {Math.round(completionRate)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* סטטיסטיקות מעוצבות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={stat.title} className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 ${stat.alert ? 'ring-2 ring-red-200 animate-pulse' : ''}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-50`}></div>
            <CardHeader className="relative pb-2">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                {stat.alert && (
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
                )}
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="space-y-3">
                <div>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                  <div className="text-xs font-medium text-green-600">
                    {Math.round(stat.progress)}%
                  </div>
                </div>
                <Progress value={stat.progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* פרויקטים אחרונים מעוצבים */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">פרויקטים אחרונים</CardTitle>
                <p className="text-sm text-muted-foreground">עדכונים מהשבוע האחרון</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground font-medium">אין פרויקטים עדיין</p>
                  <p className="text-sm text-muted-foreground mt-1">התחל ליצור פרויקטים חדשים</p>
                </div>
              ) : (
                recentProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="group relative p-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(), 'dd/MM/yyyy', { locale: he })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* משימות פעילות מעוצבות */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">משימות בעדיפות</CardTitle>
                <p className="text-sm text-muted-foreground">משימות שדורשות תשומת לב</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-16 h-16 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground font-medium">אין משימות פעילות</p>
                  <p className="text-sm text-muted-foreground mt-1">כל המשימות הושלמו בהצלחה!</p>
                </div>
              ) : (
                recentTasks.map((task, index) => {
                  const isProjectTask = 'projectId' in task;
                  const project = isProjectTask ? projects.find((p) => p.id === task.projectId) : null;
                  const isPersonal = !isProjectTask;
                  const taskDueDate = isProjectTask && task.dueDate ? task.dueDate : null;
                  
                  return (
                    <div
                      key={task.id}
                      className="group relative p-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${task.priority === 'גבוהה' ? 'bg-red-500 animate-pulse' : task.priority === 'בינונית' ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-sm leading-tight">{task.title}</h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full border ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {isPersonal ? (
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                אישי
                              </span>
                            ) : (
                              <span>{project?.name}</span>
                            )}
                            {taskDueDate && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(taskDueDate), 'dd/MM', { locale: he })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* דשבורד מתקדם */}
      <AdvancedDashboard />
    </div>
  );
}