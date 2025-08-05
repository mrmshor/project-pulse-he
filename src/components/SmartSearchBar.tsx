import { useState, useCallback, useEffect } from 'react';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Clock, Hash, User, FolderOpen, CheckSquare } from 'lucide-react';
import { Project, Task, Contact, Tag } from '@/types';

interface SmartSearchProps {
  onResultSelect?: (result: any) => void;
}

export function SmartSearchBar({ onResultSelect }: SmartSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { advancedSearch } = useAdvancedSearch();

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('searchHistory');
    if (saved) {
      setSearchHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) return [];
    
    saveToHistory(query);
    return advancedSearch({ query });
  }, [advancedSearch, saveToHistory]);

  const searchResults = searchQuery ? performSearch(searchQuery) : [];

  const getSuggestions = useCallback((query: string) => {
    if (!query) return [];
    
    const suggestions = new Set<string>();
    
    // Add search history suggestions
    searchHistory
      .filter(h => h.toLowerCase().includes(query.toLowerCase()))
      .forEach(h => suggestions.add(h));
    
    // Add smart suggestions based on context
    if (query.length >= 2) {
      const commonQueries = [
        'פרויקטים פעילים',
        'משימות דחופות',
        'משימות הושלמו השבוע',
        'אנשי קשר ללא פרויקט',
        'פרויקטים ללא יעד'
      ];
      
      commonQueries
        .filter(q => q.includes(query))
        .forEach(q => suggestions.add(q));
    }
    
    return Array.from(suggestions).slice(0, 5);
  }, [searchHistory]);

  const suggestions = getSuggestions(searchQuery);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project': return <FolderOpen size={16} className="text-blue-600" />;
      case 'task': return <CheckSquare size={16} className="text-green-600" />;
      case 'contact': return <User size={16} className="text-purple-600" />;
      default: return <Search size={16} />;
    }
  };

  const getResultPreview = (result: any) => {
    switch (result.type) {
      case 'project':
        return `${result.item.tasks?.length || 0} משימות • ${result.item.status}`;
      case 'task':
        return `עדיפות ${result.item.priority} • ${result.item.status}`;
      case 'contact':
        return `${result.item.projectIds?.length || 0} פרויקטים`;
      default:
        return '';
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="חפש פרויקטים, משימות, אנשי קשר..."
          className="input-glass pr-12 pl-4"
        />
      </div>

      {showSuggestions && (searchQuery || searchHistory.length > 0) && (
        <Card className="absolute top-full mt-2 w-full z-50 card-macos animate-scale-in">
          <CardContent className="p-0 max-h-96 overflow-y-auto">
            {/* Recent Searches */}
            {!searchQuery && searchHistory.length > 0 && (
              <div className="p-3 border-b border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock size={14} />
                  <span>חיפושים אחרונים</span>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((query, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(query);
                        performSearch(query);
                      }}
                      className="block w-full text-right p-2 hover:bg-accent rounded-lg transition-smooth text-sm"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {searchQuery && suggestions.length > 0 && (
              <div className="p-3 border-b border-border/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Hash size={14} />
                  <span>הצעות</span>
                </div>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchQuery(suggestion);
                        performSearch(suggestion);
                      }}
                      className="block w-full text-right p-2 hover:bg-accent rounded-lg transition-smooth text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchQuery && searchResults.length > 0 && (
              <div className="p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Search size={14} />
                  <span>תוצאות חיפוש ({searchResults.length})</span>
                </div>
                <div className="space-y-2">
                  {searchResults.slice(0, 8).map((result, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onResultSelect?.(result);
                        setShowSuggestions(false);
                      }}
                      className="block w-full text-right p-3 hover:bg-accent rounded-lg transition-smooth"
                    >
                      <div className="flex items-start gap-3">
                        {getResultIcon(result.type)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {result.type === 'task' 
                              ? (result.item as Task).title 
                              : (result.item as Project | Contact).name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {getResultPreview(result)}
                          </div>
                          {result.item.tags && result.item.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {result.item.tags.slice(0, 3).map((tag: Tag) => (
                                <Badge
                                  key={tag.id}
                                  className="text-xs px-2 py-0"
                                  style={{ 
                                    backgroundColor: tag.color + '20',
                                    color: tag.color 
                                  }}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        {result.score && (
                          <Badge variant="outline" className="text-xs">
                            {Math.round((1 - result.score) * 100)}%
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {searchQuery && searchResults.length === 0 && (
              <div className="p-6 text-center text-muted-foreground">
                <Search size={24} className="mx-auto mb-2 opacity-50" />
                <div>לא נמצאו תוצאות עבור "{searchQuery}"</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}