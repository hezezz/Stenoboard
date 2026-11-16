import React, { useState } from 'react';
import { Copy, Check, Trash2, Delete } from 'lucide-react';

interface TextOutputProps {
  words: string[];
  onClear: () => void;
  onBackspace: () => void;
}

export const TextOutput: React.FC<TextOutputProps> = ({ words, onClear, onBackspace }) => {
  const [copied, setCopied] = useState(false);

  // Join words into natural text with proper punctuation attachment
  const formattedText = words
    .join(' ')
    .replace(/ ([.?,\!])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  const handleCopy = () => {
    if (!formattedText) return;
    navigator.clipboard.writeText(formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="flex flex-col h-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--line)]">
        <h2 className="text-sm font-bold tracking-tight text-[var(--gold2)] flex items-center gap-2">
          <span>Translated Words</span>
          <span className="text-[11px] font-mono-steno text-[var(--mut)] font-normal">
            ({words.length} words · {formattedText.length} chars)
          </span>
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onBackspace}
            title="Delete last word (*)"
            className="p-1.5 rounded-lg text-xs font-mono-steno text-[var(--mut)] hover:text-[var(--gold2)] hover:bg-[var(--gold-bg)] transition-colors flex items-center gap-1"
          >
            <Delete className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Backspace</span>
          </button>
          <button
            onClick={handleCopy}
            title="Copy translated text"
            className="p-1.5 rounded-lg text-xs font-mono-steno text-[var(--mut)] hover:text-[var(--gold2)] hover:bg-[var(--gold-bg)] transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[var(--good)]" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Copy</span>
          </button>
          <button
            onClick={onClear}
            title="Clear all words"
            className="p-1.5 rounded-lg text-xs font-mono-steno text-[var(--mut)] hover:text-[var(--bad)] hover:bg-[var(--bad-glow)] transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      <div
        tabIndex={0}
        aria-label="Translated words text buffer"
        className="flex-1 min-h-[200px] max-h-[220px] overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--panel2)] p-4 text-lg md:text-xl font-normal leading-relaxed text-[var(--ink)] shadow-inner break-words select-text"
      >
        {formattedText ? (
          <span>{formattedText}</span>
        ) : (
          <span className="text-[var(--mut)] italic text-sm md:text-base font-normal">
            Your strokes turn into words here. Type chords on your keyboard or tap the keys below.
          </span>
        )}
      </div>
    </section>
  );
};
