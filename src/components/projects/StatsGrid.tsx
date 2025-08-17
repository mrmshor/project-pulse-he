import { DollarSign, CheckCircle, Calendar, Users, TrendingUp, Clock } from "lucide-react";
import { Project } from "@/types";
import { ProjectStatCard } from "./ProjectStatCard";

interface StatsGridProps {
  projects: Project[];
}

export function StatsGrid({ projects }: StatsGridProps) {
  const activeProjects = projects.filter(p => p.status === 'פעיל').length;
  const completedProjects = projects.filter(p => p.status === 'הושלם').length;
  const completionRate = projects.length > 0 ? Math.round((completedProjects / projects.length) * 100) : 0;
  const totalRevenue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
  const totalContacts = projects.filter(p => p.client).length;

  return (
    <section className="max-w-6xl mx-auto px-6 pb-2">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <ProjectStatCard
            colorClass="gradient-success"
            icon={<DollarSign className="w-4 h-4 text-white" />}
            title={'סה"כ הכנסות'}
            value={`₪${totalRevenue.toLocaleString()}`}
            subtitle="הכנסות ששולמו"
          />
        </div>
        <ProjectStatCard
          colorClass="gradient-success"
          icon={<CheckCircle className="w-4 h-4 text-white" />}
          title="פרויקטים שהושלמו"
          value={completedProjects}
          subtitle={`${completionRate}% מהפרויקטים`}
        />
        <ProjectStatCard
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
          icon={<Calendar className="w-4 h-4 text-white" />}
          title={'סה"כ פרויקטים'}
          value={projects.length}
          subtitle={`${activeProjects} בביצוע`}
        />
        <ProjectStatCard
          colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
          icon={<Users className="w-4 h-4 text-white" />}
          title="לקוחות פעילים"
          value={totalContacts}
          subtitle="לקוחות ייחודיים"
        />
        <ProjectStatCard
          colorClass="bg-gradient-to-br from-red-500 to-red-600"
          icon={<TrendingUp className="w-4 h-4 text-white" />}
          title="אחוז תשלומים"
          value={`0.0%`}
          subtitle={`0 מתוך ${projects.length} שולמו`}
        />
        <ProjectStatCard
          colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
          icon={<Clock className="w-4 h-4 text-white" />}
          title="הכנסות ממתינות"
          value={`₪${totalRevenue.toLocaleString()}`}
          subtitle={`מ-${projects.length} פרויקטים`}
        />
      </div>
    </section>
  );
}
