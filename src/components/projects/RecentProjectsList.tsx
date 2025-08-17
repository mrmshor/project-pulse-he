import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types";

interface RecentProjectsListProps {
  projects: Project[];
}

export function RecentProjectsList({ projects }: RecentProjectsListProps) {
  const recent = [...projects].slice(0, 10);
  return (
    <section className="max-w-6xl mx-auto px-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">פרויקטים אחרונים</h2>
        <span className="text-muted-foreground">{projects.length} פרויקטים</span>
      </div>
      <div className="space-y-3">
        {recent.map((project) => (
          <Card key={project.id} id={`project-${project.id}`} className="border-none shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">⏱</div>
                  <div>
                    <h3 className="font-semibold text-primary hover:underline cursor-pointer">
                      {project.name}
                    </h3>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <span>{project.client?.name || 'ללא לקוח'}</span>
                      <span>•</span>
                      <span>₪{(project.budget || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                    {project.status}
                  </Badge>
                  <Badge variant="outline">
                    {project.priority}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
