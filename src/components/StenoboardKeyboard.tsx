import React from 'react';
import { Zap, RotateCcw } from 'lucide-react';
import { KEY_LAYOUT } from '../data/stenoData';
import { KeyMap } from '../types/steno';
import { formatKeyCode, formatChord, translateChord } from '../utils/stenoParser';

interface StenoboardKeyboardProps {
  activeKeys: number[];
  pendingKeys: number[];
  targetKeys: number[];
  showHints: boolean;
  keyMap: KeyMap;
  onPress: (sourceId: string, stenoKeyIndex: number) => void;
  onRelease: (sourceId: string) => void;
  onTogglePendingKey: (stenoKeyIndex: number) => void;
  onCommitChord: () => void;
  onClearPendingKeys: () => void;
}

export const StenoboardKeyboard: React.FC<StenoboardKeyboardProps> = ({
  activeKeys,
  pendingKeys,
  targetKeys,
  showHints,
  keyMap,
  onPress,
  onRelease,
  onTogglePendingKey,
  onCommitChord,
  onClearPendingKeys,
}) => {
  // Invert keyMap using formatKeyCode to find physical symbols (; ' [ ] etc.)
  const indexToLabels: Record<number, string[]> = {};
  for (const [code, idx] of Object.entries(keyMap)) {
    if (!indexToLabels[idx]) indexToLabels[idx] = [];
    const formatted = formatKeyCode(code);
    indexToLabels[idx].push(formatted);
  }

  // Pre-formatted hint shortcuts
  const getHintsForIndex = (index: number) => {
    if (index === 0) return '1-0';
    const list = indexToLabels[index];
    if (list && list.length > 0) {
      return list.slice(0, 3).join(' ');
    }
    return '';
  };

  const activeSet = new Set(activeKeys);
  const targetSet = new Set(targetKeys);

  // Preview of currently selected chord (whether from mouse click or held keys)
  const currentChordPreview = activeKeys.length > 0 ? formatChord(activeKeys) : '';
  const currentTranslation = activeKeys.length > 0 ? translateChord(activeKeys) : null;

  return (
    <div className="mb-5">
      {/* Chord Builder / Status Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 mb-2.5 rounded-2xl bg-[var(--panel2)] border border-[var(--line)] shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] font-mono-steno font-semibold uppercase tracking-wider text-[var(--mut)] shrink-0">
            Current Stroke:
          </span>
          {activeKeys.length > 0 ? (
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono-steno text-sm font-bold text-[var(--gold2)] px-2 py-0.5 rounded bg-[var(--gold-bg)] border border-[var(--gold)]">
                {currentChordPreview}
              </span>
              {currentTranslation?.word && (
                <span className="text-xs text-[var(--ink)] font-semibold truncate">
                  → {currentTranslation.word}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-[var(--mut)] italic">
              Hold keys or click to build chord
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {pendingKeys.length > 0 && (
            <button
              onClick={onClearPendingKeys}
              className="p-1.5 rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--mut)] hover:text-[var(--bad)] hover:border-[var(--bad)] transition-colors text-xs flex items-center gap-1"
              title="Clear selected keys"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}

          <button
            onClick={onCommitChord}
            disabled={activeKeys.length === 0}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeKeys.length > 0
                ? 'bg-gradient-to-r from-[var(--gold2)] to-[var(--gold)] text-[var(--onink)] shadow-[0_0_12px_var(--gold-glow)] hover:opacity-95'
                : 'opacity-40 bg-[var(--line)] text-[var(--mut)] cursor-not-allowed'
            }`}
            title="Stroke chord (or press Space / Enter)"
          >
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Stroke Chord [Space]</span>
          </button>
        </div>
      </div>

      {/* Interactive Keyboard */}
      <div
        id="kb"
        aria-label="Interactive Steno Machine Keyboard"
        className="grid grid-cols-11 gap-1.5 md:gap-2.5 p-3.5 md:p-5 rounded-2xl md:rounded-3xl border border-[var(--line)] bg-[var(--panel)] shadow-2xl select-none touch-none"
        style={{
          gridTemplateRows: 'auto repeat(3, clamp(48px, 10vw, 76px))',
        }}
      >
        {KEY_LAYOUT.map((keyDef, i) => {
          const isActive = activeSet.has(keyDef.index);
          const isTarget = targetSet.has(keyDef.index);
          const hintText = getHintsForIndex(keyDef.index);

          return (
            <button
              key={`${keyDef.index}-${i}`}
              type="button"
              aria-label={`Steno key ${keyDef.label}`}
              aria-pressed={isActive}
              style={{
                gridColumn: keyDef.gridColumn,
                gridRow: keyDef.gridRow,
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                if (e.pointerType === 'mouse') {
                  // For mouse, toggle key in pending chord so multi-key chords can be clicked
                  onTogglePendingKey(keyDef.index);
                } else {
                  // For touchscreen / stylus, track active pointer
                  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
                  onPress(`p-${e.pointerId}`, keyDef.index);
                }
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                if (e.pointerType !== 'mouse') {
                  onRelease(`p-${e.pointerId}`);
                }
              }}
              onPointerCancel={(e) => {
                e.preventDefault();
                if (e.pointerType !== 'mouse') {
                  onRelease(`p-${e.pointerId}`);
                }
              }}
              className={`steno-key group ${
                keyDef.isNumBar ? 'num-bar py-1 text-xs md:text-sm rounded-xl' : 'text-base md:text-2xl'
              } ${isActive ? 'active' : ''} ${isTarget && !isActive ? 'target' : ''}`}
            >
              <span className="font-bold tracking-tight">{keyDef.label}</span>

              {showHints && hintText && (
                <span className="absolute top-1 right-1.5 md:top-1.5 md:right-2 font-mono-steno text-[9px] md:text-[10px] text-[var(--mut)] group-hover:text-[var(--gold2)] opacity-85 pointer-events-none">
                  {hintText}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
