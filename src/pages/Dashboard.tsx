import { FolderOpen, CheckSquare, TrendingUp, Activity } from 'lucide-react';
import { useProjectStore } from '@/store/useProjectStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function Dashboard() {
  const stats = useProjectStore((state) => state.getStats());
  const projects = useProjectStore((state) => state.projects);
  const tasks = useProjectStore((state) => state.tasks);

  const recentProjects = projects.slice(-3);
  const recentTasks = tasks.filter(task => task.status !== 'הושלמה').slice(-5);

  const statCards = [
    {
      title: 'סה"כ פרויקטים',
      value: stats.totalProjects,
      icon: FolderOpen,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'פרויקטים פעילים',
      value: stats.activeProjects,
      icon: Activity,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'משימות פעילות',
      value: stats.activeTasks,
      icon: CheckSquare,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'הושלמו השבוע',
      value: stats.completedThisWeek,
      icon: TrendingUp,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'תכנון':
        return 'bg-muted text-muted-foreground';
      case 'פעיל':
        return 'bg-primary text-primary-foreground';
      case 'הושלם':
        return 'bg-success text-success-foreground';
      case 'בהמתנה':
        return 'bg-secondary text-secondary-foreground';
      case 'לביצוע':
        return 'bg-muted text-muted-foreground';
      case 'בתהליך':
        return 'bg-primary text-primary-foreground';
      case 'הושלמה':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'נמוכה':
        return 'text-success';
      case 'בינונית':
        return 'text-primary';
      case 'גבוהה':
        return 'text-danger';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">דשבורד</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>פרויקטים אחרונים</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProjects.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  אין פרויקטים עדיין
                </p>
              ) : (
                recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {project.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          project.status
                        )}`}
                      >
                        {project.status}
                      </span>
                      <span
                        className={`text-sm font-medium ${getPriorityColor(
                          project.priority
                        )}`}
                      >
                        {project.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>משימות פעילות</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  אין משימות פעילות
                </p>
              ) : (
                recentTasks.map((task) => {
                  const project = projects.find((p) => p.id === task.projectId);
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{task.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project?.name}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                        <span
                          className={`text-sm font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}