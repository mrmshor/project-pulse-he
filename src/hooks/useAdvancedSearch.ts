import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useProjectStore } from '@/store/useProjectStore';
import { Project, Task, Contact } from '@/types';

export interface SearchResult {
  type: 'project' | 'task' | 'contact';
  item: Project | Task | Contact;
  score?: number;
}

export function useAdvancedSearch() {
  const { projects, tasks, contacts } = useProjectStore();

  const searchIndex = useMemo(() => {
    const allItems: SearchResult[] = [
      ...projects.map(p => ({ type: 'project' as const, item: p })),
      ...tasks.map(t => ({ type: 'task' as const, item: t })),
      ...contacts.map(c => ({ type: 'contact' as const, item: c }))
    ];

    const fuse = new Fuse(allItems, {
      keys: [
        { name: 'item.name', weight: 2 },
        { name: 'item.title', weight: 2 }, // for tasks
        { name: 'item.description', weight: 1 },
        { name: 'item.email', weight: 1 }, // for contacts
        { name: 'item.phone', weight: 1 }, // for contacts
        'item.status',
        'item.priority'
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true,
      findAllMatches: true
    });

    return fuse;
  }, [projects, tasks, contacts]);

  const search = (query: string): SearchResult[] => {
    if (!query.trim()) {
      return [];
    }

    const results = searchIndex.search(query);
    return results.map(result => ({
      ...result.item,
      score: result.score
    }));
  };

  const searchByType = (query: string, type: 'project' | 'task' | 'contact'): SearchResult[] => {
    const results = search(query);
    return results.filter(result => result.type === type);
  };

  const searchProjects = (query: string): Project[] => {
    return searchByType(query, 'project').map(r => r.item as Project);
  };

  const searchTasks = (query: string): Task[] => {
    return searchByType(query, 'task').map(r => r.item as Task);
  };

  const searchContacts = (query: string): Contact[] => {
    return searchByType(query, 'contact').map(r => r.item as Contact);
  };

  // חיפוש מתקדם עם פילטרים
  const advancedSearch = (options: {
    query?: string;
    type?: 'project' | 'task' | 'contact';
    status?: string;
    priority?: string;
    projectId?: string;
  }) => {
    let results: SearchResult[] = [];

    if (options.query) {
      results = search(options.query);
    } else {
      // אם אין query, החזר הכל
      results = [
        ...projects.map(p => ({ type: 'project' as const, item: p })),
        ...tasks.map(t => ({ type: 'task' as const, item: t })),
        ...contacts.map(c => ({ type: 'contact' as const, item: c }))
      ];
    }

    // פילטר לפי סוג
    if (options.type) {
      results = results.filter(r => r.type === options.type);
    }

    // פילטר לפי סטטוס
    if (options.status) {
      results = results.filter(r => 
        'status' in r.item && r.item.status === options.status
      );
    }

    // פילטר לפי עדיפות
    if (options.priority) {
      results = results.filter(r => 
        'priority' in r.item && r.item.priority === options.priority
      );
    }

    // פילטר לפי פרויקט (למשימות ואנשי קשר)
    if (options.projectId) {
      results = results.filter(r => {
        if (r.type === 'task') {
          return (r.item as Task).projectId === options.projectId;
        }
        if (r.type === 'contact') {
          return ((r.item as Contact).projectIds?.includes(options.projectId as string) ?? false);
        }
        return r.type === 'project' && r.item.id === options.projectId;
      });
    }

    return results;
  };

  return {
    search,
    searchByType,
    searchProjects,
    searchTasks,
    searchContacts,
    advancedSearch
  };
}