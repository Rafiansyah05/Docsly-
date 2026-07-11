import { useState, useEffect, useRef, useCallback } from 'react';
import { autosaveDocument } from '@/lib/actions/document';

export type SaveState = 'saved' | 'saving' | 'unsaved';

export function useAutosave(documentId: string, debounceMs: number = 2000) {
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerSave = useCallback((getJsonContent: () => any) => {
    setSaveState('unsaved');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(async () => {
      setSaveState('saving');
      const content = getJsonContent();
      const safeContent = JSON.parse(JSON.stringify(content));
      const result = await autosaveDocument(documentId, safeContent);
      
      if (result.success) {
        setSaveState('saved');
      } else {
        setSaveState('unsaved'); // could add 'error' state
      }
    }, debounceMs);
  }, [documentId, debounceMs]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { saveState, triggerSave };
}
