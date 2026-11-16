import React from 'react';
import { QuizCategory, PracticeItem } from '../types/steno';
import { Eye, EyeOff, SkipForward, Flame, Target } from 'lucide-react';

interface PracticeDrillProps {
  category: QuizCategory;
  onSelectCategory: (cat: QuizCategory) => void;
  currentItem: PracticeItem | null;
  sentenceWordIndex: number;
  totalSentenceWords: number;
  sentenceIndex: number;
  totalSentences: number;
  showKeysHint: boolean;
  onToggleShowKeys: () => void;
  onSkip: () => void;
  correctCount: number;
  totalAttempts: number;
  streak: number;
  flashState: 'good' | 'bad' | null;
}

export const PracticeDrill: React.FC<PracticeDrillProps> = ({
  category,
  onSelectCategory,
  currentItem,
  sentenceWordIndex,
  sentenceIndex,
  totalSentences,
  showKeysHint,
  onToggleShowKeys,
  onSkip,
  correctCount,
  totalAttempts,
  streak,
  flashState,
}) => {
  const categories: { id: QuizCategory; label: string; icon: string }[] = [
    { id: 'sentence', label: 'Sentences', icon: '📝' },
    { id: 'phrasing', label: 'Dual-Abbr Phrasing', icon: '🤝' },
    { id: 'derivatives', label: 'Derivatives', icon: '🌿' },
    { id: 'abbr', label: 'Abbreviations', icon: '⚡' },
    { id: 'days', label: 'Days', icon: '📅' },
    { id: 'months', label: 'Months', icon: '🗓️' },
    { id: 'provinces', label: 'Provinces', icon: '🇵🇭' },
    { id: 'all', label: 'All Vocab', icon: '🔤' },
  ];

  return (
    <div
      className={`rounded-2xl border bg-[var(--panel)] p-4 md:p-5 shadow-xl transition-all duration-200 mb-4 ${
        flashState === 'good'
          ? 'border-[var(--good)] shadow-[0_0_24px_var(--good-glow)]'
          : flashState === 'bad'
          ? 'border-[var(--bad)] shadow-[0_0_24px_var(--bad-glow)]'
          : 'border-[var(--line-light)]'
      }`}
    >
      {/* Quiz Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-3 border-b border-[var(--line)]">
        <span className="text-[11px] font-mono-steno font-semibold uppercase tracking-wider text-[var(--mut)] mr-1 shrink-0">
          Module:
        </span>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
              category === cat.id
                ? 'bg-[var(--gold-bg)] border border-[var(--gold)] text-[var(--gold2)] shadow-[0_0_10px_var(--gold-glow)]'
                : 'bg-[var(--panel2)] border border-[var(--line)] text-[var(--mut)] hover:text-[var(--ink)] hover:border-[var(--line-light)]'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Drill Content & Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Main Display */}
        <div className="flex-1 min-w-0">
          {category === 'sentence' && currentItem?.sentenceWords ? (
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2 text-xl md:text-2xl font-bold">
              {currentItem.sentenceWords.map((item, idx) => {
                const isDone = idx < sentenceWordIndex;
                const isCurrent = idx === sentenceWordIndex;
                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-lg transition-all duration-150 ${
                      isCurrent
                        ? 'bg-[var(--gold-bg)] text-[var(--gold2)] border border-[var(--gold)] shadow-[0_0_14px_var(--gold-glow)] scale-105'
                        : isDone
                        ? 'text-[var(--mut)] opacity-60'
                        : 'text-[var(--ink)] opacity-85'
                    }`}
                  >
                    {item.word}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="text-2xl md:text-3xl font-bold text-[var(--gold2)] tracking-tight">
              {currentItem?.displayWord || 'Ready'}
            </div>
          )}

          {/* Target Stroke Hint */}
          <div className="flex flex-wrap items-center gap-2 mt-2 text-xs md:text-sm font-mono-steno text-[var(--ink)]">
            <span className="text-[var(--mut)]">Target stroke:</span>
            {showKeysHint && currentItem ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[var(--gold-bg)] border border-[var(--gold)] text-[var(--gold2)] font-bold">
                <Target className="h-3.5 w-3.5" />
                {currentItem.targetChord}
              </span>
            ) : (
              <span className="text-[var(--mut)] italic">[Hidden - practice recall]</span>
            )}
            {currentItem?.hintLabel && showKeysHint && (
              <span className="text-[var(--mut)] text-xs">({currentItem.hintLabel})</span>
            )}
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[var(--line)]">
          <div className="text-right font-mono-steno text-xs text-[var(--mut)] leading-tight">
            {category === 'sentence' ? (
              <>
                Sentence <strong className="text-[var(--gold2)] font-bold">{sentenceIndex + 1}</strong> of{' '}
                <strong>{totalSentences}</strong>
                <br />
                Word{' '}
                <strong className="text-[var(--gold2)] font-bold">{sentenceWordIndex + 1}</strong> of{' '}
                <strong>{currentItem?.sentenceWords?.length || 0}</strong>
              </>
            ) : (
              <>
                Score: <strong className="text-[var(--good)] font-bold">{correctCount}</strong> /{' '}
                <strong>{totalAttempts}</strong>
              </>
            )}
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <Flame className="h-3.5 w-3.5 text-[var(--gold2)]" />
              <span>Streak: <strong className="text-[var(--gold2)]">{streak}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleShowKeys}
              aria-label={showKeysHint ? 'Hide target keys' : 'Show target keys'}
              className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                showKeysHint
                  ? 'border-[var(--gold)] bg-[var(--gold-bg)] text-[var(--gold2)]'
                  : 'border-[var(--line)] bg-[var(--panel2)] text-[var(--mut)] hover:text-[var(--ink)]'
              }`}
              title={showKeysHint ? 'Hide target keys' : 'Show target keys on board'}
            >
              {showKeysHint ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span className="hidden sm:inline">Keys</span>
            </button>

            <button
              onClick={onSkip}
              className="px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--panel2)] text-xs font-semibold text-[var(--ink)] hover:border-[var(--gold)] hover:text-[var(--gold2)] transition-colors flex items-center gap-1"
            >
              <SkipForward className="h-3.5 w-3.5" />
              <span>Skip</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
