import { Button } from "@/components/ui/button";
import { Download, LayoutGrid, Users } from "lucide-react";

interface ProjectsHeaderProps {
  onNewProject: () => void;
  onExportCSV: () => void;
}

export function ProjectsHeader({ onNewProject, onExportCSV }: ProjectsHeaderProps) {
  return (
    <section className="relative py-10 bg-gradient-to-b from-white to-background">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl gradient-primary shadow-glow flex items-center justify-center">
            <span className="text-xl">🚀</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
            מערכת ניהול פרויקטים Pro
          </h1>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" className="btn-glass gap-2">
            <Users className="w-4 h-4" />
            פרויקטים מתקדם
          </Button>
          <Button onClick={onNewProject} className="btn-gradient gap-2">
            <LayoutGrid className="w-4 h-4" />
            לוח בקרה Pro
          </Button>
          <Button variant="outline" onClick={onExportCSV} className="btn-glass gap-2">
            <Download className="w-4 h-4" /> CSV ייצוא
          </Button>
        </div>
      </div>
    </section>
  );
}
