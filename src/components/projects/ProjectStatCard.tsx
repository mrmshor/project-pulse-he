import { ReactNode } from "react";

interface ProjectStatCardProps {
  colorClass: string; // e.g. "gradient-success"
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
}

export function ProjectStatCard({ colorClass, icon, title, value, subtitle }: ProjectStatCardProps) {
  return (
    <div className={`rounded-2xl p-5 text-white relative overflow-hidden ${colorClass}`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full translate-x-10 -translate-y-10" />
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {subtitle && <div className="text-sm opacity-85">{subtitle}</div>}
      </div>
    </div>
  );
}
