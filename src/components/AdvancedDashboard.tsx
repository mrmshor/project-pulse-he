import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useProjectStore } from '@/store/useProjectStore';
import { subDays, format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import { he } from 'date-fns/locale';

const chartConfig = {
  completed: {
    label: "הושלמו",
    color: "hsl(var(--primary))",
  },
  active: {
    label: "פעילים", 
    color: "hsl(var(--secondary))",
  },
  planned: {
    label: "בתכנון",
    color: "hsl(var(--muted))",
  },
};

const priorityColors = {
  'גבוהה': '#ef4444',
  'בינונית': '#f59e0b', 
  'נמוכה': '#10b981'
};

export function AdvancedDashboard() {
  const { projects, tasks } = useProjectStore();

  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map(day => {
      const dayStr = format(day, 'dd/MM', { locale: he });
      const tasksForDay = tasks.filter(task => 
        task.dueDate && format(new Date(task.dueDate), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );

      return {
        date: dayStr,
        completed: tasksForDay.filter(task => task.status === 'הושלמה').length,
        active: tasksForDay.filter(task => task.status === 'בתהליך').length,
        planned: tasksForDay.filter(task => task.status === 'לביצוע').length,
      };
    });
  }, [tasks]);

  const statusData = useMemo(() => {
    const statuses = ['תכנון', 'פעיל', 'הושלם', 'בהמתנה'] as const;
    return statuses.map(status => ({
      name: status,
      value: projects.filter(p => p.status === status).length,
      fill: status === 'הושלם' ? '#10b981' : 
            status === 'פעיל' ? '#3b82f6' :
            status === 'תכנון' ? '#f59e0b' : '#6b7280'
    }));
  }, [projects]);

  const priorityData = useMemo(() => {
    const priorities = ['גבוהה', 'בינונית', 'נמוכה'] as const;
    return priorities.map(priority => ({
      name: priority,
      tasks: tasks.filter(t => t.priority === priority).length,
      projects: projects.filter(p => p.priority === priority).length,
      fill: priorityColors[priority]
    }));
  }, [tasks, projects]);

  return (
    <div className="space-y-8" dir="rtl">
      {/* כותרת אזור הגרפים */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          ניתוח נתונים מתקדם
        </h2>
        <p className="text-muted-foreground">תובנות ומגמות מהנתונים שלך</p>
      </div>

      {/* שורה ראשונה - גרפים יומיים ושבועיים */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* התקדמות שבועית */}
        <Card className="xl:col-span-2 border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm">📈</span>
                </div>
                <div>
                  <CardTitle className="text-lg">התקדמות שבועית</CardTitle>
                  <p className="text-sm text-muted-foreground">משימות לפי יום השבוע</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded-full">
                השבוע הנוכחי
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    domain={[0, 'dataMax + 1']}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#10b981' }}
                    activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: '#ffffff' }}
                    name="הושלמו"
                  />
                  <Line 
                    dataKey="active" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#3b82f6' }}
                    activeDot={{ r: 7, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
                    name="פעילים"
                  />
                  <Line 
                    dataKey="planned" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#f59e0b' }}
                    activeDot={{ r: 7, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
                    name="בתכנון"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* סטטוס פרויקטים */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎯</span>
              </div>
              <div>
                <CardTitle className="text-lg">סטטוס פרויקטים</CardTitle>
                <p className="text-sm text-muted-foreground">התפלגות לפי מצב</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={90}
                    paddingAngle={2}
                    label={({ name, value, percent }) => 
                      value > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : null
                    }
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value, name) => [value, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            {/* מקרא */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {statusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.fill }}
                  ></div>
                  <span className="text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* שורה שנייה - התפלגות עדיפויות */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚡</span>
              </div>
              <div>
                <CardTitle className="text-lg">התפלגות עדיפויות</CardTitle>
                <p className="text-sm text-muted-foreground">משימות ופרויקטים לפי רמת עדיפות</p>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded-full">
              {priorityData.reduce((sum, item) => sum + item.tasks + item.projects, 0)} פריטים סה"כ
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* גרף עמודות אופקי */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-4">פילוח לפי סוג</h4>
              <ChartContainer config={chartConfig} className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} layout="horizontal" margin={{ top: 10, right: 30, left: 60, bottom: 10 }}>
                    <XAxis 
                      type="number" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#374151' }}
                      width={60}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="tasks" 
                      name="משימות"
                      radius={[0, 4, 4, 0]}
                      fill="#8884d8"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-tasks-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                    <Bar 
                      dataKey="projects" 
                      name="פרויקטים"
                      radius={[0, 4, 4, 0]}
                      fill="#82ca9d"
                      opacity={0.8}
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-projects-${index}`} fill={entry.fill} opacity={0.7} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* תצוגת נתונים */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">סיכום עדיפויות</h4>
              {priorityData.map((priority, index) => (
                <div key={index} className="p-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: priority.fill }}
                      ></div>
                      <span className="font-medium text-foreground">{priority.name}</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">
                      {priority.tasks + priority.projects}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">משימות:</span>
                      <span className="font-medium">{priority.tasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">פרויקטים:</span>
                      <span className="font-medium">{priority.projects}</span>
                    </div>
                  </div>
                  
                  {/* פרוגרס בר קטן */}
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: priority.fill,
                          width: `${((priority.tasks + priority.projects) / Math.max(...priorityData.map(p => p.tasks + p.projects))) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}