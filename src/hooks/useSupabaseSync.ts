import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import type { Project, Task, Contact } from '@/types';

export function useSupabaseSync() {
  const { user, isAuthenticated } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load data from Supabase
  const loadFromSupabase = useCallback(async () => {
    if (!isAuthenticated || !user) return null;

    try {
      setIsSyncing(true);

      const [projectsRes, tasksRes, contactsRes, timeEntriesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('user_id', user.id),
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('contacts').select('*').eq('user_id', user.id),
        supabase.from('time_entries').select('*').eq('user_id', user.id),
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (tasksRes.error) throw tasksRes.error;
      if (contactsRes.error) throw contactsRes.error;
      if (timeEntriesRes.error) throw timeEntriesRes.error;

      return {
        projects: projectsRes.data || [],
        tasks: tasksRes.data || [],
        contacts: contactsRes.data || [],
        timeEntries: timeEntriesRes.data || [],
      };
    } catch (error) {
      console.error('Error loading from Supabase:', error);
      toast.error('שגיאה בטעינת הנתונים מהשרת');
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, user]);

  // Save project to Supabase
  const saveProject = useCallback(async (project: Omit<Project, 'id'> & { id?: string }) => {
    if (!isAuthenticated || !user) return null;

    try {
      const { contacts, ...projectData } = project;
      const supabaseProject = {
        ...projectData,
        user_id: user.id,
        title: project.name || '',
        client_name: project.client?.name,
        client_email: project.client?.email,
        client_phone: project.client?.phone,
        folder_path: project.folderPath,
        total_budget: project.budget,
        start_date: project.startDate,
        end_date: project.dueDate,
      };

      let result;
      if (project.id) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update(supabaseProject)
          .eq('id', project.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new project
        const { data, error } = await supabase
          .from('projects')
          .insert(supabaseProject)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error saving project:', error);
      toast.error('שגיאה בשמירת הפרויקט');
      return null;
    }
  }, [isAuthenticated, user]);

  // Save task to Supabase
  const saveTask = useCallback(async (task: Omit<Task, 'id'> & { id?: string }) => {
    if (!isAuthenticated || !user) return null;

    try {
      const supabaseTask = {
        ...task,
        user_id: user.id,
        project_id: task.projectId,
        due_date: task.dueDate,
        completed_at: task.completed ? new Date().toISOString() : null,
        estimated_hours: task.estimatedTime ? task.estimatedTime / 60 : null,
      };

      let result;
      if (task.id) {
        // Update existing task
        const { data, error } = await supabase
          .from('tasks')
          .update(supabaseTask)
          .eq('id', task.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new task
        const { data, error } = await supabase
          .from('tasks')
          .insert(supabaseTask)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('שגיאה בשמירת המשימה');
      return null;
    }
  }, [isAuthenticated, user]);

  // Save contact to Supabase
  const saveContact = useCallback(async (contact: Omit<Contact, 'id'> & { id?: string }) => {
    if (!isAuthenticated || !user) return null;

    try {
      const contactData = {
        ...contact,
        user_id: user.id,
      };

      let result;
      if (contact.id) {
        // Update existing contact
        const { data, error } = await supabase
          .from('contacts')
          .update(contactData)
          .eq('id', contact.id)
          .eq('user_id', user.id)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Create new contact
        const { data, error } = await supabase
          .from('contacts')
          .insert(contactData)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error saving contact:', error);
      toast.error('שגיאה בשמירת איש הקשר');
      return null;
    }
  }, [isAuthenticated, user]);

  // Delete functions
  const deleteProject = useCallback(async (projectId: string) => {
    if (!isAuthenticated || !user) return false;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('שגיאה במחיקת הפרויקט');
      return false;
    }
  }, [isAuthenticated, user]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!isAuthenticated || !user) return false;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('שגיאה במחיקת המשימה');
      return false;
    }
  }, [isAuthenticated, user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Trigger a re-fetch or update local state
          setLastSyncTime(new Date());
        }
      )
      .subscribe();

    const tasksChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setLastSyncTime(new Date());
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(projectsChannel);
      supabase.removeChannel(tasksChannel);
    };
  }, [isAuthenticated, user]);

  return {
    isSyncing,
    lastSyncTime,
    loadFromSupabase,
    saveProject,
    saveTask,
    saveContact,
    deleteProject,
    deleteTask,
  };
}