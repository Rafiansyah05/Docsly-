import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { Bot, Loader2, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import React from 'react';

const STAGES = [
  { id: 'classify', keys: ['classify', 'classified'], label: 'Memahami konteks permintaan' },
  { id: 'context', keys: ['context', 'analyze_requirements', 'questions_needed'], label: 'Menganalisis dokumen & referensi' },
  { id: 'execute', keys: ['execute'], label: 'Menyusun kerangka & menulis konten' },
  { id: 'compliance', keys: ['compliance', 'done'], label: 'Memformat tata bahasa & PUEBI' },
];

const AiTypingComponent = (props: any) => {
  const { node } = props;
  const currentStage = node.attrs.stage || 'classify';
  const percent = node.attrs.percent || 15;
  const words = node.attrs.words || 0;
  const draftText = node.attrs.draftText || '';
  
  // Find current stage index based on keys
  let currentIndex = 0;
  STAGES.forEach((stage, idx) => {
    if (stage.keys.includes(currentStage)) {
      currentIndex = idx;
    }
  });
  
  // If stage is 'done' or past 'compliance', mark all as done
  if (currentStage === 'done') currentIndex = 4;

  return (
    <NodeViewWrapper className="ai-typing-node my-6 w-full" contentEditable={false}>
      <div className="relative overflow-hidden rounded-xl border border-blue-200/50 dark:border-blue-900/30 bg-white dark:bg-gray-900 p-5 shadow-sm transition-all">
        {/* Animated glowing background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent dark:via-blue-900/10 -translate-x-full animate-[shimmer_2s_infinite]"></div>
        
        {/* Top Header */}
        <div className="flex flex-col gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  Docsly AI Agent sedang menulis...
                </span>
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
              </div>
              
              {/* Progress Bar */}
              <div className="flex items-center gap-3 mt-1.5 w-64">
                <div className="h-1.5 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300 ease-out" 
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-medium">{percent}%</span>
              </div>
            </div>
          </div>

          {/* Draft Text Preview */}
          {draftText && (
            <div className="mt-3 ml-14 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700/50 text-sm text-gray-700 dark:text-gray-300 font-serif leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {draftText}
              <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse align-middle"></span>
            </div>
          )}
          
          {/* Stages List */}
          <div className="flex flex-col gap-2.5 ml-14 mt-2">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isPending = idx > currentIndex;
              
              return (
                <div key={stage.id} className={`flex items-center gap-3 transition-opacity duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : isCurrent ? (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" />
                  )}
                  
                  <span className={`text-sm ${isCompleted ? 'text-gray-500 dark:text-gray-400' : isCurrent ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-400 dark:text-gray-600'}`}>
                    {stage.label}
                    {isCurrent && stage.id === 'execute' && words > 0 && (
                      <span className="ml-2 text-blue-500 font-normal opacity-80">(~{words} kata)</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export const AiTyping = Node.create({
  name: 'aiTyping',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      text: { default: 'Docsly AI sedang memproses...' },
      draftText: { default: '' },
      stage: { default: 'classify' },
      percent: { default: 15 },
      words: { default: 0 },
      id: { default: 'ai-typing-indicator' }
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="ai-typing"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'ai-typing' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AiTypingComponent);
  },
});
