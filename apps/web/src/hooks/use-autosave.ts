import { useState, useEffect, useRef, useCallback } from 'react';

export type SaveState = 'saved' | 'saving' | 'unsaved';

/**
 * Calls the /api/autosave REST endpoint.
 * Using fetch (not Server Action) so we can set keepalive=true for
 * beforeunload / visibilitychange flush saves.
 */
async function saveToApi(
  documentId: string,
  content: any,
  keepalive = false
): Promise<boolean> {
  try {
    const body = JSON.stringify({ documentId, content });
    const res = await fetch('/api/autosave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive, // survive page unload
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useAutosave(documentId: string, debounceMs = 1000) {
  const [saveState, setSaveState] = useState<SaveState>('saved');

  // Refs to avoid stale closures
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingContentRef = useRef<(() => any) | null>(null);
  const isSavingRef = useRef(false);
  const saveStateRef = useRef<SaveState>('saved');

  // Keep saveStateRef in sync
  const updateSaveState = useCallback((state: SaveState) => {
    saveStateRef.current = state;
    setSaveState(state);
  }, []);

  /**
   * Execute a save immediately (no debounce).
   * Returns true if save succeeded.
   */
  const flushSave = useCallback(
    async (keepalive = false): Promise<boolean> => {
      if (!pendingContentRef.current) return true; // Nothing pending

      const getContent = pendingContentRef.current;
      pendingContentRef.current = null;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      isSavingRef.current = true;
      updateSaveState('saving');

      let content: any;
      try {
        content = getContent();
        content = JSON.parse(JSON.stringify(content)); // deep clone / sanitize
      } catch {
        isSavingRef.current = false;
        updateSaveState('unsaved');
        return false;
      }

      const success = await saveToApi(documentId, content, keepalive);
      isSavingRef.current = false;
      updateSaveState(success ? 'saved' : 'unsaved');
      return success;
    },
    [documentId, updateSaveState]
  );

  /**
   * Debounced save trigger — called on every editor update.
   */
  const triggerSave = useCallback(
    (getJsonContent: () => any) => {
      // Store the latest content getter
      pendingContentRef.current = getJsonContent;
      updateSaveState('unsaved');

      // Reset the debounce timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        flushSave();
      }, debounceMs);
    },
    [debounceMs, flushSave, updateSaveState]
  );

  useEffect(() => {
    /**
     * Flush on tab hidden (user switches tabs / minimises window).
     * This fires BEFORE the page is unloaded in most browsers.
     */
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushSave(true);
      }
    };

    /**
     * Flush on page unload / navigation.
     * keepalive=true ensures the fetch survives even if the page is closing.
     */
    const handleBeforeUnload = () => {
      flushSave(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    // pagehide fires on mobile Safari where beforeunload is unreliable
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);

      // On React unmount (SPA navigation), flush any pending save.
      // We cannot await here (cleanup must be sync), so we kick off
      // the fetch with keepalive so it survives the unmount.
      if (pendingContentRef.current) {
        // Clear the debounce timeout first so it doesn't double-fire
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        const getContent = pendingContentRef.current;
        pendingContentRef.current = null;
        try {
          const content = JSON.parse(JSON.stringify(getContent()));
          // Fire-and-forget with keepalive — browser will complete
          // this request even after the component unmounts.
          fetch('/api/autosave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId, content }),
            keepalive: true,
          }).catch(() => {});
        } catch {
          // ignore serialisation errors on unmount
        }
      } else if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [documentId, flushSave]);

  return { saveState, triggerSave, flushSave };
}
