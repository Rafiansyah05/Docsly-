import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Check, X, Loader2, Sparkles, StopCircle, User, ArrowRight, Plus, Mic, FileText, ImageIcon, Sheet, History, MessageSquarePlus, Quote, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Claude } from '@lobehub/icons';

interface AiSidebarProps {
  editor: any;
  documentId: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PendingSuggestion {
  pos: number;
  type: string;
  text: string;
  suggestionType: 'insert' | 'delete';
}

type WorkflowState = 'chat' | 'outline_review' | 'writing_content' | 'asking_questions';

const formatMessageContent = (content: string) => {
  if (!content) return null;
  const parts = content.split('\n');
  return parts.map((part, i) => {
    const boldParts = part.split(/(\*\*.*?\*\*)/g);
    return (
      <React.Fragment key={i}>
        {boldParts.map((bp, j) => {
          if (bp.startsWith('**') && bp.endsWith('**')) {
            return (
              <strong key={j} className="font-bold">
                {bp.slice(2, -2)}
              </strong>
            );
          }
          return bp;
        })}
        {i < parts.length - 1 && <br />}
      </React.Fragment>
    );
  });
};

export function AiSidebar({ editor, documentId }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Halo! Saya adalah Asisten AI Docsly. Apa yang bisa saya bantu hari ini? Anda bisa meminta saya menulis dokumen dari awal, memeriksa tata bahasa, atau merangkum tulisan.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stageLabel, setStageLabel] = useState('Memproses...');
  const [progress, setProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<PendingSuggestion[]>([]);
  const [workflowState, setWorkflowState] = useState<WorkflowState>('chat');
  const [headingsToWrite, setHeadingsToWrite] = useState<{ text: string; index: number }[]>([]);
  const [currentHeadingIndex, setCurrentHeadingIndex] = useState<number>(0);

  // Smart Question Engine States
  const [smartQuestions, setSmartQuestions] = useState<string[]>([]);
  const [assumedFields, setAssumedFields] = useState<string[]>([]);
  const [questionAnswers, setQuestionAnswers] = useState<Record<number, string>>({});
  const [pendingPrompt, setPendingPrompt] = useState<string>('');

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedContext, setSelectedContext] = useState<string>('');
  const [viewMode, setViewMode] = useState<'chat' | 'history'>('chat');
  const [pastConversations, setPastConversations] = useState<{ id: string; judul_percakapan: string; dibuat_pada: string }[]>([]);
  const sseRef = useRef<EventSource | null>(null);
  const supabase = createClient();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isResizing = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string }[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Resize handling
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
  };

  const resize = (e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth > 280 && newWidth < 600) {
      setWidth(newWidth);
    }
  };

  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
  };

  // Responsive auto-collapse on small screens
  useEffect(() => {
    const handleResizeWindow = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };
    handleResizeWindow();
    window.addEventListener('resize', handleResizeWindow);
    return () => window.removeEventListener('resize', handleResizeWindow);
  }, []);

  // Initialize Session and Fetch Past Conversations
  useEffect(() => {
    const initSession = async () => {
      if (!documentId) return;

      // Hanya ambil riwayat percakapan sebelumnya
      const { data: convs } = await supabase.from('ai_conversations').select('id, judul_percakapan, dibuat_pada').eq('document_id', documentId).order('dibuat_pada', { ascending: false });

      if (convs) {
        setPastConversations(convs);
      }
    };

    initSession();
  }, [documentId, supabase]);

  const startNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        role: 'assistant',
        content: 'Halo! Saya adalah Asisten AI Docsly. Apa yang bisa saya bantu hari ini? Anda bisa meminta saya menulis dokumen dari awal, memeriksa tata bahasa, atau merangkum tulisan.',
      },
    ]);
    setViewMode('chat');
  };

  const deleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    // Simpan status lama untuk berjaga-jaga jika gagal
    const previousConversations = [...pastConversations];

    setPastConversations((prev) => prev.filter((c) => c.id !== convId));
    if (conversationId === convId) {
      startNewChat();
    }

    // Hapus pesan terkait terlebih dahulu
    const { error: err1 } = await supabase.from('prompt_history').delete().eq('conversation_id', convId);

    // Hapus sesi percakapannya
    const { error: err2 } = await supabase.from('ai_conversations').delete().eq('id', convId);

    if (err1 || err2) {
      console.error('Delete error:', err1 || err2);
      toast.error(`Gagal menghapus riwayat: ${(err1 || err2)?.message || 'Terjadi kesalahan server'}`);
      // Kembalikan ke state semula
      setPastConversations(previousConversations);
    }
  };

  const loadConversation = async (convId: string) => {
    setConversationId(convId);

    const { data: history } = await supabase.from('prompt_history').select('user_prompt, ai_response').eq('conversation_id', convId).order('dibuat_pada', { ascending: true });

    const loadedMessages: Message[] = [
      {
        role: 'assistant',
        content: 'Sesi percakapan dilanjutkan dari riwayat.',
      },
    ];

    if (history && history.length > 0) {
      history.forEach((h) => {
        loadedMessages.push({ role: 'user', content: h.user_prompt });
        loadedMessages.push({ role: 'assistant', content: h.ai_response });
      });
    }
    setMessages(loadedMessages);
    setViewMode('chat');
  };

  // Poll suggestions from the editor doc
  useEffect(() => {
    if (!editor) return;

    const updateSuggestions = () => {
      const list: PendingSuggestion[] = [];
      editor.state.doc.descendants((node: any, pos: number) => {
        if (node.attrs && node.attrs.suggestion) {
          list.push({
            pos,
            type: node.type.name,
            text: node.textContent || '',
            suggestionType: node.attrs.suggestion,
          });
          return false;
        }
      });
      setSuggestions(list);

      const { from, to, empty } = editor.state.selection;
      if (!empty) {
        const text = editor.state.doc.textBetween(from, to, ' ');
        setSelectedContext(text);
      } else {
        setSelectedContext('');
      }
    };

    editor.on('update', updateSuggestions);
    editor.on('selectionUpdate', updateSuggestions);
    updateSuggestions();

    return () => {
      editor.off('update', updateSuggestions);
      editor.off('selectionUpdate', updateSuggestions);
    };
  }, [editor]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const maxH = 240;
    el.style.height = Math.min(el.scrollHeight, maxH) + 'px';
    el.style.overflowY = el.scrollHeight > maxH ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    autoResize();
  }, [input, autoResize]);

  // Close attach menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({ name: f.name, type: f.type }));
    setAttachedFiles((prev) => [...prev, ...mapped]);
    setShowAttachMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachedFile = (i: number) => {
    setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleMic = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (isListening) {
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.onresult = (ev: any) => {
      const transcript = ev.results[0][0].transcript;
      setInput((prev) => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon className="h-3 w-3" />;
    if (type.includes('sheet') || type.includes('csv')) return <Sheet className="h-3 w-3" />;
    return <FileText className="h-3 w-3" />;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setAttachedFiles([]);
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setProgress(5);
    setStageLabel('Menghubungi server AI...');

    const finalPrompt = selectedContext ? `[Konteks Teks Terpilih: "${selectedContext}"]\n\nPrompt Pengguna: "${userMessage}"` : userMessage;

    let activeConversationId = conversationId;

    // Create new conversation on first message
    if (!activeConversationId) {
      const title = userMessage.length > 35 ? userMessage.substring(0, 35) + '...' : userMessage;
      const { data: newConv } = await supabase.from('ai_conversations').insert({ document_id: documentId, judul_percakapan: title }).select('id').single();

      if (newConv) {
        activeConversationId = newConv.id;
        setConversationId(newConv.id);

        // Refresh past conversations list
        const { data: convs } = await supabase.from('ai_conversations').select('id, judul_percakapan, dibuat_pada').eq('document_id', documentId).order('dibuat_pada', { ascending: false });
        if (convs) setPastConversations(convs);
      }
    }

    // Close any existing SSE
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    try {
      // POST the request first to get the stream URL pattern
      // We use fetch with streaming
      const response = await fetch('http://localhost:3001/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          documentJson: editor.getJSON(),
          activeBlockIndex: getActiveBlockIndex(),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Server error ${response.status}: ${errText}`);
      }

      if (!response.body) throw new Error('No response body from server.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType = 'message';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (eventType === 'progress') {
              setStageLabel(data.label || 'Memproses...');
              setProgress(data.percent || 0);
            }

            if (eventType === 'result') {
              setIsLoading(false);
              setProgress(0);

              if (data.operations) {
                editor.commands.applyAiOperations(data.operations);
              }

              let responseContent = data.explanation || 'Selesai! Perubahan telah diterapkan ke dokumen.';

              if (data.intent === 'generate_outline') {
                setWorkflowState('outline_review');
                responseContent = 'Saya telah menyusun kerangka (outline) dokumen di editor. Silakan tinjau dan konfirmasi di bawah untuk mulai menulis isi bab secara bertahap.';
              }

              if (data.intent === 'ask_questions') {
                setWorkflowState('asking_questions');
                setSmartQuestions(data.questions || []);
                setAssumedFields(data.assumedFields || []);
                setPendingPrompt(userMessage); // Simpan prompt asli
                responseContent = data.explanation || 'Saya membutuhkan informasi tambahan.';
              }

              // Save to database
              if (activeConversationId && data.intent !== 'ask_questions') {
                supabase
                  .from('prompt_history')
                  .insert({
                    conversation_id: activeConversationId,
                    user_prompt: userMessage,
                    ai_response: responseContent,
                  })
                  .then(); // fire and forget
              }

              setMessages((prev) => [
                ...prev,
                {
                  role: 'assistant',
                  content: responseContent,
                },
              ]);
            }

            if (eventType === 'error') {
              throw new Error(data.message || 'Kesalahan dari server AI.');
            }
          } catch (parseErr) {
            console.error('SSE parse error:', parseErr);
          }
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      setProgress(0);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Error: ${error.message || 'Terjadi kesalahan saat menghubungi server AI.'}`,
        },
      ]);
    }
  };

  const handleStop = () => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    setIsLoading(false);
    setProgress(0);
    setStageLabel('Memproses...');
    setWorkflowState('chat');
    setMessages((prev) => [...prev, { role: 'assistant', content: 'Proses dihentikan oleh pengguna.' }]);
  };

  const getActiveBlockIndex = (): number => {
    if (!editor) return 0;
    const { from } = editor.state.selection;
    let activeIndex = 0;
    let found = false;

    editor.state.doc.forEach((node: any, offset: number) => {
      if (found) return;
      if (from >= offset && from <= offset + node.nodeSize) {
        found = true;
      } else {
        activeIndex++;
      }
    });

    return activeIndex;
  };

  // Accept Outline & Start writing content step-by-step
  const handleConfirmOutline = () => {
    const positions: number[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.attrs && node.attrs.suggestion === 'insert') {
        positions.push(pos);
      }
    });
    positions.reverse().forEach((pos) => {
      editor.commands.acceptSuggestion(pos);
    });

    // 2. Scan document to find all headings to write content for
    const headings: { text: string; index: number }[] = [];
    let index = 0;
    editor.state.doc.forEach((node: any) => {
      if (node.type.name === 'heading') {
        headings.push({
          text: node.textContent,
          index,
        });
      }
      index++;
    });

    if (headings.length === 0) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Outline disetujui, tetapi saya tidak menemukan heading/bab untuk ditulis.' }]);
      setWorkflowState('chat');
      return;
    }

    setHeadingsToWrite(headings);
    setCurrentHeadingIndex(0);
    setWorkflowState('writing_content');

    // Start generating the first section
    writeSectionContent(headings[0], 0, headings);
  };

  const handleRejectOutline = () => {
    const positions: number[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.attrs && node.attrs.suggestion === 'insert') {
        positions.push(pos);
      }
    });
    positions.reverse().forEach((pos) => {
      editor.commands.rejectSuggestion(pos);
    });

    setWorkflowState('chat');
    setMessages((prev) => [...prev, { role: 'assistant', content: 'Outline ditolak. Silakan berikan instruksi baru untuk membuat dokumen.' }]);
  };

  const writeSectionContent = async (heading: { text: string; index: number }, headingIdx: number, allHeadings: { text: string; index: number }[]) => {
    setIsLoading(true);
    setProgress(15);
    setStageLabel(`Menulis bagian: "${heading.text}"...`);
    setMessages((prev) => [...prev, { role: 'assistant', content: `✍️ Sedang menulis konten untuk bagian: "${heading.text}"...` }]);

    try {
      // Find current heading's live index in the document
      let liveIndex = 0;
      let currentIndex = 0;
      editor.state.doc.forEach((node: any) => {
        if (node.type.name === 'heading' && node.textContent === heading.text) {
          liveIndex = currentIndex;
        }
        currentIndex++;
      });

      const response = await fetch('http://localhost:3001/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Tuliskan isi paragraf yang sangat informatif, formal, mendalam, dan lengkap untuk bagian Bab/Heading: "${heading.text}". Pastikan teks output murni hitam tanpa dekorasi warna atau highlight.`,
          documentJson: editor.getJSON(),
          activeBlockIndex: liveIndex,
          intent: 'generate_content',
        }),
      });

      if (!response.ok || !response.body) throw new Error('Failed to start content generation');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType = 'message';
          let dataStr = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
          }
          if (!dataStr) continue;
          try {
            const data = JSON.parse(dataStr);
            if (eventType === 'progress') {
              setStageLabel(data.label || 'Memproses...');
              setProgress(data.percent || 0);
            }
            if (eventType === 'result') {
              setIsLoading(false);
              setProgress(0);
              if (data.operations) {
                editor.commands.applyAiOperations(data.operations);
              }

              const responseContent = data.explanation || 'Selesai! Perubahan telah diterapkan ke dokumen.';
              if (conversationId) {
                supabase
                  .from('prompt_history')
                  .insert({
                    conversation_id: conversationId,
                    user_prompt: `Tuliskan isi paragraf yang sangat informatif, formal, mendalam, dan lengkap untuk bagian Bab/Heading: "${heading.text}".`,
                    ai_response: responseContent,
                  })
                  .then();
              }
            }
            if (eventType === 'error') throw new Error(data.message);
          } catch (_) { }
        }
      }
    } catch (e) {
      console.error('Failed to write section:', e);
      setIsLoading(false);
      setProgress(0);
      setMessages((prev) => [...prev, { role: 'assistant', content: `❌ Maaf, gagal menulis konten untuk "${heading.text}".` }]);
    }
  };

  const handleNextSection = () => {
    const nextIdx = currentHeadingIndex + 1;
    if (nextIdx < headingsToWrite.length) {
      setCurrentHeadingIndex(nextIdx);
      writeSectionContent(headingsToWrite[nextIdx], nextIdx, headingsToWrite);
    } else {
      setWorkflowState('chat');
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Seluruh bagian dokumen telah berhasil ditulis! Silakan tinjau dan edit dokumen Anda.' }]);
    }
  };

  const handleAcceptAllPending = () => {
    const positions: number[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.attrs && node.attrs.suggestion) {
        positions.push(pos);
      }
    });
    positions.reverse().forEach((pos) => {
      editor.commands.acceptSuggestion(pos);
    });
  };

  const handleRejectAllPending = () => {
    const positions: number[] = [];
    editor.state.doc.descendants((node: any, pos: number) => {
      if (node.attrs && node.attrs.suggestion) {
        positions.push(pos);
      }
    });
    positions.reverse().forEach((pos) => {
      editor.commands.rejectSuggestion(pos);
    });
  };

  const handleAccept = (pos: number) => {
    editor.commands.acceptSuggestion(pos);
  };

  const handleReject = (pos: number) => {
    editor.commands.rejectSuggestion(pos);
  };

  const handleSubmitAnswers = () => {
    // Kumpulkan jawaban dan kirim kembali ke AI
    const answersText = smartQuestions.map((q, i) => `Q: ${q}\nA: ${questionAnswers[i] || 'Lewati'}`).join('\n');
    const newPrompt = `${pendingPrompt}\n\nTambahan Informasi dari pengguna:\n${answersText}`;

    setWorkflowState('chat');
    setSmartQuestions([]);
    setQuestionAnswers({});

    // Hapus input field agar tidak menampilkan prompt panjang
    setInput('');
    // Kita panggil handleSend khusus karena setInput asinkron
    executeAiRequest(newPrompt, 'submit_answers');
  };

  const handleSkipQuestions = () => {
    setWorkflowState('chat');
    setSmartQuestions([]);
    setQuestionAnswers({});

    executeAiRequest(pendingPrompt, 'skip_questions');
  };

  const executeAiRequest = async (promptToSend: string, actionStr: string) => {
    setIsLoading(true);
    setProgress(5);
    setStageLabel('Melanjutkan proses AI...');

    const finalPrompt = selectedContext ? `[Konteks Teks Terpilih: "${selectedContext}"]\n\nPrompt Pengguna: "${promptToSend}"` : promptToSend;

    try {
      const response = await fetch('http://localhost:3001/ai/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          documentJson: editor.getJSON(),
          activeBlockIndex: getActiveBlockIndex(),
          action: actionStr,
        }),
      });

      if (!response.ok) throw new Error('Gagal menghubungi server AI');
      if (!response.body) throw new Error('Tidak ada respons');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const lines = part.split('\n');
          let eventType = 'message';
          let dataStr = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7).trim();
            if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
          }
          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (eventType === 'progress') {
              setStageLabel(data.label || 'Memproses...');
              setProgress(data.percent || 0);
            }
            if (eventType === 'result') {
              setIsLoading(false);
              setProgress(0);
              if (data.operations) {
                editor.commands.applyAiOperations(data.operations);
              }

              let responseContent = data.explanation || 'Selesai! Perubahan telah diterapkan ke dokumen.';
              if (data.intent === 'generate_outline') {
                setWorkflowState('outline_review');
                responseContent = 'Saya telah menyusun kerangka (outline) dokumen di editor. Silakan tinjau dan konfirmasi di bawah untuk mulai menulis isi bab secara bertahap.';
              }

              if (conversationId) {
                supabase
                  .from('prompt_history')
                  .insert({
                    conversation_id: conversationId,
                    user_prompt: promptToSend,
                    ai_response: responseContent,
                  })
                  .then();
              }
              setMessages((prev) => [...prev, { role: 'assistant', content: responseContent }]);
            }
            if (eventType === 'error') throw new Error(data.message);
          } catch (e) { }
        }
      }
    } catch (error: any) {
      console.error('Error in executeAiRequest:', error);
      setIsLoading(false);
      setProgress(0);
      setMessages((prev) => [...prev, { role: 'assistant', content: `❌ Error: ${error.message}` }]);
    }
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-l bg-slate-50 flex flex-col items-center py-4 gap-4 h-full shadow-sm z-20 flex-shrink-0 transition-all duration-300">
        <button onClick={() => setIsCollapsed(false)} className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-colors shadow-sm" title="Buka Asisten AI">
          <Sparkles className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: `${width}px` }} className="relative border-l bg-white flex flex-col h-full shadow-sm z-20 flex-shrink-0 transition-all duration-100">
      {/* Drag Resize Handle */}
      <div onMouseDown={startResize} className="absolute top-0 left-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 active:bg-blue-600 transition-colors z-30" />

      {/* Sidebar Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between bg-slate-50 pl-5 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0 whitespace-nowrap">
          <Sparkles className="h-4 w-4 text-blue-600 flex-shrink-0" />

          <span className="font-semibold text-slate-800 text-base truncate">
            Docsly AI
          </span>

          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              Powered by
            </span>

            <Claude.Color
              size={18}

            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {workflowState !== 'chat' && viewMode === 'chat' && <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">Mode Alur Kerja</span>}
          <button onClick={startNewChat} className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors flex items-center gap-1" title="Chat Baru">
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'chat' ? 'history' : 'chat')}
            className="p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors flex items-center gap-1"
            title={viewMode === 'chat' ? 'Lihat Riwayat Chat' : 'Kembali ke Chat'}
          >
            {viewMode === 'chat' ? <History className="h-4 w-4" /> : <MessageSquarePlus className="h-4 w-4" />}
          </button>
          <button onClick={() => setIsCollapsed(true)} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors" title="Sembunyikan">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {viewMode === 'history' ? (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Riwayat Percakapan</h3>
              {pastConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg border text-sm transition-colors group relative ${conversationId === conv.id ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-zinc-200 text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <div className="font-medium truncate pr-6">{conv.judul_percakapan}</div>
                  <div className="text-xs text-slate-500 mt-1">{new Date(conv.dibuat_pada).toLocaleString('id-ID')}</div>
                  <div
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                    title="Hapus riwayat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </div>
                </button>
              ))}
              {pastConversations.length === 0 && <div className="text-center text-sm text-slate-500 py-8">Belum ada riwayat percakapan untuk dokumen ini.</div>}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-zinc-200 text-zinc-600'}`}>
                      {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                    </div>
                    <div
                      className={`rounded-xl px-3.5 py-2.5 text-[15px] leading-relaxed border ${msg.role === 'user' ? 'bg-[#006EFF] text-white border-transparent rounded-tr-sm' : 'bg-zinc-100 text-zinc-800 border-transparent rounded-tl-sm'
                        }`}
                    >
                      {formatMessageContent(msg.content)}
                    </div>
                  </div>
                ))}

                {workflowState === 'asking_questions' && !isLoading && (
                  <div className="bg-white border-2 border-blue-100 rounded-lg p-4 shadow-sm space-y-4 mr-auto w-full max-w-[95%]">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Sparkles className="h-4 w-4" />
                      <span className="text-sm font-semibold">Tingkatkan Kualitas Dokumen</span>
                    </div>
                    <p className="text-xs text-slate-600">Saya menyadari beberapa detail penting belum disebutkan. Jawab pertanyaan berikut untuk hasil yang lebih presisi, atau lewati agar AI mengasumsikannya secara otomatis.</p>
                    <div className="space-y-3">
                      {smartQuestions.map((q, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <label className="text-xs font-medium text-slate-700 block">{q}</label>
                          <input
                            type="text"
                            placeholder="Ketik jawaban (opsional)"
                            className="w-full text-sm border-b focus:border-blue-500 outline-none px-1 py-1 text-slate-700 bg-slate-50/50 focus:bg-white transition-colors"
                            value={questionAnswers[idx] || ''}
                            onChange={(e) => setQuestionAnswers((prev) => ({ ...prev, [idx]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 pt-2">
                      <Button onClick={handleSubmitAnswers} size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5">
                        Kirim Jawaban
                      </Button>
                      <Button onClick={handleSkipQuestions} size="sm" variant="outline" className="w-full text-slate-600 hover:text-slate-800 hover:bg-slate-50 text-sm py-1.5">
                        Lewati (Biar AI yang Asumsikan)
                      </Button>
                    </div>
                  </div>
                )}

                {workflowState === 'outline_review' && !isLoading && (
                  <div className="bg-white border rounded-lg p-3 shadow-sm space-y-3 mr-auto max-w-[85%]">
                    <span className="text-sm font-semibold text-slate-700 block">Apakah kerangka (outline) ini sesuai?</span>
                    <p className="text-xs text-slate-500">Jika Anda menyetujui, AI akan menulis konten untuk setiap heading di atas secara bertahap.</p>
                    <div className="flex flex-col gap-1.5">
                      <Button onClick={handleConfirmOutline} size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-1">
                        Setuju & Mulai Tulis Isi
                      </Button>
                      <Button onClick={handleRejectOutline} size="sm" variant="ghost" className="w-full text-slate-600 hover:text-slate-800 text-sm py-1">
                        Tolak Outline
                      </Button>
                    </div>
                  </div>
                )}

                {workflowState === 'writing_content' && !isLoading && (
                  <div className="bg-white border rounded-lg p-3 shadow-sm space-y-3 mr-auto max-w-[85%]">
                    <span className="text-sm font-semibold text-slate-700 block">
                      Bagian {currentHeadingIndex + 1} dari {headingsToWrite.length} Selesai
                    </span>
                    <p className="text-xs text-slate-600 font-medium">Selesai menulis: "{headingsToWrite[currentHeadingIndex]?.text}"</p>
                    <p className="text-xs text-slate-400">Tinjau tulisan hijau di editor. Anda bisa menerima, mengedit, atau lanjut ke bagian berikutnya.</p>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <Button onClick={handleNextSection} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm py-1 flex items-center justify-center gap-1.5">
                        Lanjut Tulis Bagian Berikutnya
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => {
                          handleAcceptAllPending();
                          setWorkflowState('chat');
                          setMessages((prev) => [...prev, { role: 'assistant', content: 'Proses penulisan bertahap dihentikan. Semua saran aktif telah diterima.' }]);
                        }}
                        size="sm"
                        variant="ghost"
                        className="w-full text-red-600 hover:text-red-700 text-sm py-1"
                      >
                        Selesai & Keluar Alur Kerja
                      </Button>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="flex items-center gap-2 text-slate-500 mr-auto max-w-[85%] bg-white border rounded-lg rounded-tl-none p-3 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />
                    <div className="flex flex-col gap-1 w-full">
                      <span className="text-sm font-medium text-slate-700">{stageLabel}</span>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{progress}% selesai</span>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 h-6 px-2 mt-2 w-max text-xs" onClick={handleStop}>
                        <StopCircle className="h-3.5 w-3.5 mr-1" />
                        Hentikan
                      </Button>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </>
          )}

          {suggestions.length > 0 && (
            <div className="border-t bg-white p-3 mt-4 rounded-xl">
              <div className="text-sm font-semibold text-slate-600 mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  Saran Perbaikan ({suggestions.length})
                </div>
                <div className="flex gap-2 text-xs">
                  <button onClick={handleAcceptAllPending} className="text-emerald-600 hover:underline">
                    Terima Semua
                  </button>
                  <button onClick={handleRejectAllPending} className="text-rose-600 hover:underline">
                    Tolak Semua
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {suggestions.map((sug, i) => (
                  <div key={i} className={`p-2 rounded border text-xs flex flex-col justify-between gap-2 shadow-sm ${sug.suggestionType === 'insert' ? 'border-emerald-200 bg-emerald-50/30' : 'border-rose-200 bg-rose-50/30'}`}>
                    <div className="flex justify-between items-start">
                      <span className={`font-semibold px-1 rounded text-[10px] uppercase ${sug.suggestionType === 'insert' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {sug.suggestionType === 'insert' ? 'Tambah' : 'Hapus'}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px] truncate">{sug.type}</span>
                    </div>
                    <p className="text-slate-600 italic line-clamp-2">"{sug.text || 'Teks kosong'}"</p>
                    <div className="flex gap-1.5 self-end">
                      <button onClick={() => handleAccept(sug.pos)} className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded flex items-center justify-center transition-colors" title="Terima">
                        <Check className="h-3 w-3" />
                      </button>
                      <button onClick={() => handleReject(sug.pos)} className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded flex items-center justify-center transition-colors" title="Tolak">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-white flex-shrink-0">
          <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xlsx,.xls,.pptx,.ppt,.txt,.csv,image/*" className="hidden" onChange={handleFileAttach} />

          <div className="relative rounded-xl transition-colors duration-200" style={{ background: '#F4F4F5' }}>
            {selectedContext && (
              <div className="flex px-4 pt-3 pb-0">
                <div className="flex items-center gap-2 bg-zinc-200/50 text-slate-700 rounded-lg px-3 py-1.5 text-[13px] font-medium w-full">
                  <Quote className="h-3 w-3 shrink-0 text-slate-400" />
                  <span className="truncate flex-1">{selectedContext}</span>
                </div>
              </div>
            )}

            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-0">
                {attachedFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
                    {getFileIcon(f.type)}
                    <span className="truncate max-w-[100px]">{f.name}</span>
                    <button onClick={() => removeAttachedFile(i)} className="ml-0.5 hover:text-blue-900 transition-colors">
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={workflowState === 'chat' ? 'Tanyakan sesuatu atau / untuk perintah...' : 'Alur kerja aktif...'}
              disabled={isLoading || workflowState !== 'chat'}
              rows={1}
              className="w-full resize-none bg-transparent text-slate-800 placeholder-slate-400 text-[15px] leading-relaxed px-4 pt-3.5 pb-2 focus:outline-none disabled:opacity-50"
              style={{ minHeight: '52px', maxHeight: '240px', overflowY: 'hidden' }}
            />

            <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
              <div className="relative" ref={attachMenuRef}>
                <button
                  onClick={() => setShowAttachMenu((v) => !v)}
                  disabled={isLoading}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-150 disabled:opacity-40"
                  title="Lampirkan file"
                >
                  <Plus className="h-4 w-4" />
                </button>
                {showAttachMenu && (
                  <div className="absolute bottom-10 left-0 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 min-w-[180px] z-50">
                    {[
                      { label: 'PDF', ext: '.pdf,application/pdf' },
                      { label: 'Word (.docx)', ext: '.doc,.docx' },
                      { label: 'Excel / CSV', ext: '.xlsx,.xls,.csv' },
                      { label: 'PowerPoint', ext: '.pptx,.ppt' },
                      { label: 'Gambar', ext: 'image/*' },
                      { label: 'File Teks', ext: '.txt' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                        onClick={() => {
                          if (fileInputRef.current) {
                            fileInputRef.current.accept = item.ext;
                            fileInputRef.current.click();
                          }
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span className="text-slate-400 text-[11px] leading-snug text-center flex-1 px-2 select-none">AI dapat membuat kesalahan. Verifikasi informasi penting.</span>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleMic}
                  disabled={isLoading}
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-150 disabled:opacity-40 ${isListening ? 'bg-red-500 text-white animate-pulse shadow-sm' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  title={isListening ? 'Berhenti merekam' : 'Input suara'}
                >
                  <Mic className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim() || workflowState !== 'chat'}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-white transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #006EFF 0%, #264791 100%)' }}
                  title="Kirim"
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
