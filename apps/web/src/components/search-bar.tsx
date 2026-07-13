'use client';

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, FolderOpen, Clock, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  judul: string;
  workspace_id: string;
  workspace_name: string;
  diperbarui_pada: string;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch results from API
  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q.trim())}`,
        { cache: 'no-store' }
      );
      if (!res.ok) throw new Error('Search failed');
      const json = await res.json();
      setResults(json.results ?? []);
      setIsOpen(true);
      setActiveIndex(-1);
    } catch {
      setResults([]);
      setIsOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!val.trim()) {
      setResults([]);
      setIsOpen(false);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      fetchResults(val);
    }, 300);
  };

  // Navigate to document
  const handleSelect = (result: SearchResult) => {
    router.push(`/w/${result.workspace_id}/d/${result.id}`);
    setQuery('');
    setIsOpen(false);
    setResults([]);
    setHasSearched(false);
    inputRef.current?.blur();
  };

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-[260px]" role="search">
      {/* Search input */}
      <div className="relative flex items-center">
        {isLoading ? (
          <Loader2 className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#94A3B8] animate-spin" />
        ) : (
          <Search className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#94A3B8]" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() && (results.length > 0 || hasSearched)) {
              setIsOpen(true);
            }
          }}
          placeholder="Cari dokumen..."
          autoComplete="off"
          spellCheck={false}
          aria-label="Cari dokumen"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          className="h-9 w-full rounded-[10px] border border-[#E2E8F0] dark:border-zinc-800 bg-[#F8FAFC] dark:bg-zinc-900/50 pl-9 pr-4 text-[13px] text-[#111827] dark:text-zinc-100 placeholder:text-[#94A3B8] outline-none transition-all duration-200 focus:border-[#93C5FD] dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-zinc-950 focus:shadow-[0_0_0_3px_rgba(37,99,235,0.06)] dark:focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          role="listbox"
          aria-label="Hasil pencarian dokumen"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[200] overflow-hidden rounded-xl border border-[#E8EDF5] dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-black/40"
          style={{ minWidth: '320px', right: 'auto' }}
        >
          {results.length > 0 ? (
            <>
              {/* Header label */}
              <div className="px-3 pt-2.5 pb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-[#94A3B8]">
                  Dokumen
                </span>
              </div>

              {/* Results list */}
              <ul className="pb-1.5">
                {results.map((result, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <li
                      key={result.id}
                      role="option"
                      aria-selected={isActive}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(-1)}
                        onClick={() => handleSelect(result)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100 ${
                          isActive ? 'bg-[#F8FAFC] dark:bg-zinc-900' : 'hover:bg-[#F8FAFC] dark:hover:bg-zinc-900'
                        }`}
                      >
                        {/* Doc icon */}
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-100 ${
                            isActive ? 'bg-[#EFF6FF] dark:bg-blue-900/20' : 'bg-[#F1F5F9] dark:bg-zinc-800'
                          }`}
                        >
                          <FileText
                            className={`h-[15px] w-[15px] transition-colors duration-100 ${
                              isActive ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#64748B] dark:text-zinc-400'
                            }`}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-[13px] font-medium truncate leading-tight transition-colors duration-100 ${
                              isActive ? 'text-[#1D4ED8] dark:text-blue-400' : 'text-[#111827] dark:text-zinc-200'
                            }`}
                          >
                            {result.judul}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <FolderOpen className="h-[11px] w-[11px] text-[#94A3B8] shrink-0" />
                            <span className="text-[11px] text-[#94A3B8] truncate">
                              {result.workspace_name}
                            </span>
                          </div>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Clock className="h-[11px] w-[11px] text-[#CBD5E1]" />
                          <span className="text-[11px] text-[#94A3B8] whitespace-nowrap">
                            {formatRelativeDate(result.diperbarui_pada)}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Footer hint */}
              <div className="border-t border-[#F1F5F9] dark:border-zinc-800 px-3 py-2 flex items-center gap-2">
                <kbd className="inline-flex h-5 items-center rounded border border-[#E2E8F0] dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-800 px-1.5 font-mono text-[10px] text-[#94A3B8] dark:text-zinc-400">
                  ↑↓
                </kbd>
                <span className="text-[11px] text-[#94A3B8] dark:text-zinc-500">navigasi</span>
                <kbd className="ml-1 inline-flex h-5 items-center rounded border border-[#E2E8F0] dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-800 px-1.5 font-mono text-[10px] text-[#94A3B8] dark:text-zinc-400">
                  ↵
                </kbd>
                <span className="text-[11px] text-[#94A3B8] dark:text-zinc-500">buka</span>
                <kbd className="ml-1 inline-flex h-5 items-center rounded border border-[#E2E8F0] dark:border-zinc-700 bg-[#F8FAFC] dark:bg-zinc-800 px-1.5 font-mono text-[10px] text-[#94A3B8] dark:text-zinc-400">
                  Esc
                </kbd>
                <span className="text-[11px] text-[#94A3B8] dark:text-zinc-500">tutup</span>
              </div>
            </>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center px-4 py-8">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5F9] dark:bg-zinc-800">
                <Search className="h-4 w-4 text-[#94A3B8]" />
              </div>
              <p className="text-[13px] font-medium text-[#64748B] dark:text-zinc-300">
                Tidak ada hasil
              </p>
              <p className="mt-1 text-center text-[12px] text-[#94A3B8] dark:text-zinc-500">
                Tidak ditemukan dokumen dengan nama{' '}
                <span className="font-medium text-[#64748B] dark:text-zinc-400">
                  &ldquo;{query}&rdquo;
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
