import { useState, useCallback } from 'react';
import { Tag } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Hash } from 'lucide-react';

interface TagManagerProps {
  entity: { tags: Tag[] };
  availableTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onCreateTag?: (tag: Omit<Tag, 'id'>) => void;
}

const TAG_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export function TagManager({ entity, availableTags, onTagsChange, onCreateTag }: TagManagerProps) {
  const [newTagName, setNewTagName] = useState('');
  const [showTagCreator, setShowTagCreator] = useState(false);
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);

  const addTag = (tag: Tag) => {
    if (!entity.tags.find(t => t.id === tag.id)) {
      onTagsChange([...entity.tags, tag]);
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(entity.tags.filter(t => t.id !== tagId));
  };

  const createNewTag = useCallback(() => {
    if (!newTagName.trim() || !onCreateTag) return;

    const newTag: Omit<Tag, 'id'> = {
      name: newTagName.trim(),
      color: selectedColor || '#3B82F6',
      category: 'custom'
    };

    onCreateTag(newTag);
    setNewTagName('');
    setShowTagCreator(false);
    setSelectedColor(TAG_COLORS[0]);
  }, [newTagName, selectedColor, onCreateTag]);

  const filteredAvailableTags = availableTags.filter(
    tag => !entity.tags.find(t => t.id === tag.id)
  );

  return (
    <div className="space-y-3">
      {/* Current Tags */}
      <div className="flex flex-wrap gap-2">
        {entity.tags.map(tag => (
          <Badge
            key={tag.id}
            className="inline-flex items-center gap-1 px-3 py-1 transition-smooth hover:scale-105"
            style={{ 
              backgroundColor: tag.color + '20', 
              color: tag.color,
              border: `1px solid ${tag.color}40`
            }}
          >
            {tag.icon && <span>{tag.icon}</span>}
            {tag.name}
            <button
              onClick={() => removeTag(tag.id)}
              className="ml-1 hover:bg-red-500 hover:text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
            >
              <X size={10} />
            </button>
          </Badge>
        ))}
      </div>

      {/* Available Tags */}
      {filteredAvailableTags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">תגיות זמינות:</div>
          <div className="flex flex-wrap gap-2">
            {filteredAvailableTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => addTag(tag)}
                className="btn-glass text-xs px-2 py-1 border transition-smooth hover:shadow-elegant"
                style={{ borderColor: tag.color + '60' }}
              >
                <Hash size={12} className="inline mr-1" />
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add New Tag */}
      <div className="space-y-2">
        {!showTagCreator ? (
          <Button
            onClick={() => setShowTagCreator(true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Plus size={14} />
            הוסף תגית חדשה
          </Button>
        ) : (
          <div className="glass p-3 rounded-lg space-y-3">
            <Input
              placeholder="שם התגית..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="input-glass"
              onKeyPress={(e) => e.key === 'Enter' && createNewTag()}
            />
            
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">בחר צבע:</div>
              <div className="flex gap-2">
                {TAG_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-smooth ${
                      selectedColor === color ? 'scale-125 border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={createNewTag} size="sm" className="btn-gradient">
                צור תגית
              </Button>
              <Button 
                onClick={() => {
                  setShowTagCreator(false);
                  setNewTagName('');
                }}
                variant="outline" 
                size="sm"
              >
                ביטול
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}