import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { TaskDialog } from "@/components/TaskDialog";

export function QuickTasksPanel() {
  const { tasks } = useProjectStore();
  const [open, setOpen] = useState(false);

  const completed = tasks.filter(t => t.status === 'הושלם').length;
  const pending = tasks.length - completed;

  return (
    <>
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            משימות מהירות
            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => setOpen(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">ממתינות {pending}</Badge>
            <Badge variant="secondary">הושלמו {completed}</Badge>
          </div>
          <Button className="w-full" variant="outline" onClick={() => setOpen(true)}>
            הוסף משימה חדשה...
          </Button>
        </CardContent>
      </Card>
      <TaskDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
