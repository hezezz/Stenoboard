import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Keyboard, Check, Layers, AlertCircle } from 'lucide-react';
import { KeyMap } from '../types/steno';
import { KEY_LAYOUT, KEY_MAP_PRESETS, STENO_ORDER } from '../data/stenoData';
import { formatChord, formatKeyCode } from '../utils/stenoParser';

interface KeyMappingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  keyMap: KeyMap;
  onUpdateKeyMap: (newMap: KeyMap) => void;
  onResetKeyMap: () => void;
  activeKeys: number[];
}

export const KeyMappingDrawer: React.FC<KeyMappingDrawerProps> = ({
  isOpen,
  onClose,
  keyMap,
  onUpdateKeyMap,
  onResetKeyMap,
  activeKeys,
}) => {
  const [listeningKeyIndex, setListeningKeyIndex] = useState<number | null>(null);
  const [tempMap, setTempMap] = useState<KeyMap>({ ...keyMap });
  const [activePreset, setActivePreset] = useState<string>('standard');
  const [notice, setNotice] = useState<string | null>(null);

  // Sync tempMap with keyMap when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTempMap({ ...keyMap });
      setListeningKeyIndex(null);
      setNotice(null);
    }
  }, [isOpen, keyMap]);

  // Keyboard capture for remapping
  useEffect(() => {
    if (listeningKeyIndex === null || !isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setListeningKeyIndex(null);
        return;
      }

      const code = e.code;
      if (!code) return;

      // Update mapping
      const nextMap = { ...tempMap };
      // Remove this physical key if it was bound elsewhere
      delete nextMap[code];
      // Assign to current listening steno key index
      nextMap[code] = listeningKeyIndex;

      setTempMap(nextMap);
      setListeningKeyIndex(null);
      setNotice(`Assigned "${formatKeyCode(code)}" to steno key ${KEY_LAYOUT.find((k) => k.index === listeningKeyIndex)?.label || ''}`);
      setTimeout(() => setNotice(null), 3000);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [listeningKeyIndex, tempMap, isOpen]);

  if (!isOpen) return null;

  // Invert map to show which physical keys map to which steno index
  const indexToPhysicalKeys: Record<number, string[]> = {};
  for (const [code, stenoIdx] of Object.entries(tempMap)) {
    if (!indexToPhysicalKeys[stenoIdx]) indexToPhysicalKeys[stenoIdx] = [];
    const cleanLabel = formatKeyCode(code);
    indexToPhysicalKeys[stenoIdx].push(cleanLabel);
  }

  const applyPreset = (presetId: string) => {
    const preset = KEY_MAP_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setTempMap({ ...preset.mapping });
      setActivePreset(presetId);
      setNotice(`Applied ${preset.name}`);
      setTimeout(() => setNotice(null), 2500);
    }
  };

  const handleSave = () => {
    onUpdateKeyMap(tempMap);
    onClose();
  };

  // Unique steno key definitions
  const uniqueKeys = [
    { index: 0, label: '# (Number Bar)', finger: 'Number row (1-0)' },
    { index: 1, label: 'S- (Initial S)', finger: 'Left Pinky' },
    { index: 2, label: 'T- (Initial T)', finger: 'Left Ring Top' },
    { index: 3, label: 'K- (Initial K)', finger: 'Left Ring Bottom' },
    { index: 4, label: 'P- (Initial P)', finger: 'Left Middle Top' },
    { index: 5, label: 'W- (Initial W)', finger: 'Left Middle Bottom' },
    { index: 6, label: 'H- (Initial H)', finger: 'Left Index Top' },
    { index: 7, label: 'R- (Initial R)', finger: 'Left Index Bottom' },
    { index: 10, label: '* (Star / Correction)', finger: 'Index Fingers (T, G, Y, H)' },
    { index: 8, label: 'A (Vowel A)', finger: 'Left Thumb' },
    { index: 9, label: 'O (Vowel O)', finger: 'Left Thumb' },
    { index: 11, label: 'E (Vowel E)', finger: 'Right Thumb' },
    { index: 12, label: 'U (Vowel U)', finger: 'Right Thumb' },
    { index: 13, label: '-F (Final F)', finger: 'Right Index Top' },
    { index: 14, label: '-R (Final R)', finger: 'Right Index Bottom' },
    { index: 15, label: '-P (Final P)', finger: 'Right Middle Top' },
    { index: 16, label: '-B (Final B)', finger: 'Right Middle Bottom' },
    { index: 17, label: '-L (Final L)', finger: 'Right Ring Top' },
    { index: 18, label: '-G (Final G)', finger: 'Right Ring Bottom' },
    { index: 19, label: '-T (Final T)', finger: 'Right Pinky Top' },
    { index: 20, label: '-S (Final S)', finger: 'Right Pinky Bottom' },
    { index: 21, label: '-D (Final D)', finger: 'Right Pinky Far Top' },
    { index: 22, label: '-Z (Final Z)', finger: 'Right Pinky Far Bottom' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keymap-drawer-title"
    >
      <div className="relative w-full max-w-lg h-full bg-[var(--panel)] border-l border-[var(--line-light)] p-6 shadow-2xl flex flex-col text-[var(--ink)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div>
            <h2 id="keymap-drawer-title" className="text-xl font-bold text-[var(--gold2)] flex items-center gap-2 font-sans">
              <Keyboard className="h-5 w-5 text-[var(--gold)]" />
              Customize Key Mapping
            </h2>
            <p className="text-xs text-[var(--mut)] mt-1">
              Click any steno key to listen for a laptop keypress, or choose a layout preset.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close key mapper"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel2)] text-[var(--mut)] hover:border-[var(--gold)] hover:text-[var(--gold2)] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Notification pill */}
        {notice && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-[var(--gold-bg)] border border-[var(--gold)] text-[var(--gold2)] text-xs font-mono-steno flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Layout Presets */}
        <div className="mt-4 mb-2">
          <label className="text-xs font-mono-steno uppercase text-[var(--mut)] font-semibold tracking-wider block mb-2">
            Layout Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            {KEY_MAP_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.id)}
                className={`px-2.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                  activePreset === preset.id
                    ? 'border-[var(--gold)] bg-[var(--gold-bg)] text-[var(--gold2)] shadow-[0_0_12px_var(--gold-glow)]'
                    : 'border-[var(--line)] bg-[var(--panel2)] text-[var(--mut)] hover:text-[var(--ink)] hover:border-[var(--line-light)]'
                }`}
              >
                {preset.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Live Test Strip */}
        <div className="my-3 p-3 rounded-xl bg-black/40 border border-[var(--line)]">
          <div className="flex items-center justify-between text-xs text-[var(--mut)] font-mono-steno mb-1">
            <span>LIVE CHORD TEST</span>
            <span className="text-[var(--gold2)] font-bold">
              {activeKeys.length > 0 ? formatChord(activeKeys) : 'Idle (Hold keys)'}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--panel2)] overflow-hidden">
            <div
              className="h-full bg-[var(--gold)] transition-all duration-75"
              style={{ width: `${Math.min(100, activeKeys.length * 15)}%` }}
            />
          </div>
        </div>

        {/* Key Mapping List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-2">
          {uniqueKeys.map((item) => {
            const isListening = listeningKeyIndex === item.index;
            const assigned = indexToPhysicalKeys[item.index] || [];

            return (
              <div
                key={item.index}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isListening
                    ? 'border-[var(--gold)] bg-[var(--gold-bg)] shadow-[0_0_16px_var(--gold-glow)]'
                    : 'border-[var(--line)] bg-[var(--panel2)] hover:border-[var(--line-light)]'
                }`}
              >
                <div>
                  <span className="font-mono-steno font-bold text-sm text-[var(--gold2)] block">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-[var(--mut)]">{item.finger}</span>
                </div>

                <div className="flex items-center gap-2">
                  {isListening ? (
                    <span className="animate-pulse px-3 py-1 rounded bg-[var(--gold)] text-[var(--onink)] font-mono-steno font-bold text-xs">
                      Press any key...
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1 items-center justify-end max-w-[180px]">
                      {assigned.length > 0 ? (
                        assigned.map((code) => (
                          <span
                            key={code}
                            className="px-2 py-0.5 rounded bg-black/40 border border-[var(--line)] text-xs font-mono-steno font-semibold text-[var(--ink)]"
                          >
                            {code}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[var(--bad)] italic">Unassigned</span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => setListeningKeyIndex(isListening ? null : item.index)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--ink)] hover:border-[var(--gold)] hover:text-[var(--gold2)] transition-colors"
                  >
                    {isListening ? 'Cancel' : 'Remap'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-2 border-t border-[var(--line)] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onResetKeyMap();
              setTempMap({ ...KEY_MAP_PRESETS[0].mapping });
              setActivePreset('standard');
              setNotice('Reset to default keyboard layout');
              setTimeout(() => setNotice(null), 2500);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-[var(--line)] bg-[var(--panel2)] text-xs font-semibold text-[var(--mut)] hover:text-[var(--bad)] hover:border-[var(--bad)] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[var(--line)] bg-[var(--panel2)] text-xs font-semibold text-[var(--ink)] hover:text-[var(--gold2)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-[var(--gold2)] to-[var(--gold)] text-xs font-bold text-[var(--onink)] shadow-[0_0_14px_var(--gold-glow)] hover:opacity-95 transition-opacity"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
