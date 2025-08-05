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
    <div className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* התקדמות שבועית */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 התקדמות שבועית
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    dataKey="completed" 
                    stroke="var(--color-completed)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="הושלמו"
                  />
                  <Line 
                    dataKey="active" 
                    stroke="var(--color-active)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="פעילים"
                  />
                  <Line 
                    dataKey="planned" 
                    stroke="var(--color-planned)" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    name="בתכנון"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* סטטוס פרויקטים */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🎯 התפלגות סטטוס פרויקטים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* התפלגות עדיפויות */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚡ התפלגות עדיפויות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="horizontal">
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false}
                  width={60}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="tasks" 
                  name="משימות"
                  radius={[0, 4, 4, 0]}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
                <Bar 
                  dataKey="projects" 
                  name="פרויקטים"
                  radius={[0, 4, 4, 0]}
                  opacity={0.7}
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}