import React, { useEffect, useRef } from 'react';
import { Trash2, Copy, Check } from 'lucide-react';
import { TapeEntry } from '../types/steno';
import { STENO_ORDER } from '../data/stenoData';

interface PaperTapeProps {
  entries: TapeEntry[];
  onClear: () => void;
}

export const PaperTape: React.FC<PaperTapeProps> = ({ entries, onClear }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const handleCopyTape = () => {
    if (entries.length === 0) return;
    const text = entries
      .map((e) => `${e.columns}   ${e.translation}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="flex flex-col h-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--line)]">
        <h2 className="text-sm font-bold tracking-tight text-[var(--gold2)] flex items-center gap-2">
          <span>Digital Paper Tape</span>
          <span className="text-[11px] font-mono-steno text-[var(--mut)] font-normal">
            ({entries.length} strokes)
          </span>
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyTape}
            title="Copy tape transcript"
            className="p-1.5 rounded-lg text-xs font-mono-steno text-[var(--mut)] hover:text-[var(--gold2)] hover:bg-[var(--gold-bg)] transition-colors flex items-center gap-1"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[var(--good)]" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Copy</span>
          </button>
          <button
            onClick={onClear}
            title="Clear paper tape"
            className="p-1.5 rounded-lg text-xs font-mono-steno text-[var(--mut)] hover:text-[var(--bad)] hover:bg-[var(--bad-glow)] transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        tabIndex={0}
        aria-label="Stenotype paper tape log"
        className="flex-1 min-h-[200px] max-h-[220px] overflow-y-auto overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--tape)] p-3 font-mono-steno text-xs text-[var(--tapeink)] shadow-inner select-text"
      >
        {/* Header with columns */}
        <div className="text-[var(--mut)] border-b border-[var(--line)] pb-1.5 mb-2 font-bold whitespace-pre tracking-widest text-[11px]">
          {STENO_ORDER.split('').join(' ')}
        </div>

        {entries.length === 0 ? (
          <div className="py-12 text-center text-[var(--mut)] italic text-xs">
            Paper tape ready. Chords will stamp here in steno order.
          </div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between gap-4 border-t border-dotted border-[var(--line)]/50 pt-1 whitespace-pre hover:bg-[var(--gold-bg)]/20 px-1 rounded transition-colors"
              >
                <span className="tracking-widest font-medium select-all">
                  {entry.columns}
                </span>
                <span className="font-bold text-[var(--gold2)] text-right select-all pl-2 shrink-0">
                  {entry.translation}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
