import { useState, useEffect, useRef, useCallback } from 'react';
import { TapeEntry, KeyMap } from '../types/steno';
import { DEFAULT_KEY_MAP } from '../data/stenoData';
import {
  formatChord,
  translateChord,
  getTapeColumns,
  lookupMultiStroke,
} from '../utils/stenoParser';
import { stenoAudio } from '../utils/audio';

const STORAGE_KEY_MAP = 'stenoboard_key_map';
const STORAGE_WORDS = 'stenoboard_words';
const STORAGE_STICKY = 'stenoboard_sticky_mode';

interface StrokeRecord {
  chord: string;
  wordCount: number;
}

export function useStenoEngine(onChordCommit?: (chord: string, word: string) => void) {
  // Key mapping state
  const [keyMap, setKeyMap] = useState<KeyMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MAP);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...DEFAULT_KEY_MAP };
  });

  // Sticky Keys mode (allows sequential key presses & touch taps without dropping 4-6 key chords)
  const [stickyMode, setStickyMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_STICKY) === 'true';
    } catch {}
    return false;
  });

  const toggleStickyMode = useCallback(() => {
    setStickyMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_STICKY, String(next));
      } catch {}
      return next;
    });
  }, []);

  // Active sources (e.g. "KeyW" -> 2, "p-1" -> 2)
  const activeSourcesRef = useRef<Map<string, number>>(new Map());
  // Accumulated keys during current down stroke
  const currentStrokeRef = useRef<Set<number>>(new Set());

  // React state for keyboard visual highlight
  const [activeKeys, setActiveKeys] = useState<number[]>([]);

  // Words output buffer
  const [words, setWords] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WORDS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Paper tape history
  const [tapeEntries, setTapeEntries] = useState<TapeEntry[]>([]);

  // Multi-stroke history tracking (e.g. ["TPHEU"] -> when "TPHA" commits -> replace with "Nina")
  const strokeHistoryRef = useRef<StrokeRecord[]>([]);
  const [recentChords, setRecentChords] = useState<string[]>([]);

  // Sync words to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WORDS, JSON.stringify(words));
    } catch {}
  }, [words]);

  // Save keyMap to localStorage
  const updateKeyMap = useCallback((newMap: KeyMap) => {
    setKeyMap(newMap);
    try {
      localStorage.setItem(STORAGE_KEY_MAP, JSON.stringify(newMap));
    } catch {}
  }, []);

  const resetKeyMap = useCallback(() => {
    updateKeyMap({ ...DEFAULT_KEY_MAP });
  }, [updateKeyMap]);

  // Pending latched keys for mouse / sticky chord building
  const [pendingKeys, setPendingKeys] = useState<number[]>([]);
  const pendingKeysRef = useRef<number[]>(pendingKeys);
  pendingKeysRef.current = pendingKeys;

  const commitKeys = useCallback(
    (keysToCommit: number[]) => {
      const keys = Array.from(new Set(keysToCommit)).sort((a, b) => a - b);
      currentStrokeRef.current.clear();
      setPendingKeys([]);

      if (keys.length === 0) return;

      stenoAudio.playChordCommit();
      const result = translateChord(keys);
      const columns = getTapeColumns(keys);

      if (result.isCorrection) {
        const lastRecord = strokeHistoryRef.current.pop();
        const removeCount = lastRecord ? lastRecord.wordCount : 1;
        setRecentChords(strokeHistoryRef.current.slice(-3).map((r) => r.chord));

        const newEntry: TapeEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          rawChord: formatChord(keys),
          formattedChord: result.formattedChord,
          translation: result.label,
          columns,
          timestamp: Date.now(),
        };
        setTapeEntries((prev) => [...prev, newEntry]);
        setWords((prev) => (prev.length > 0 ? prev.slice(0, Math.max(0, prev.length - removeCount)) : prev));

        if (onChordCommit) {
          onChordCommit(result.formattedChord, result.word);
        }
        return;
      }

      // Check multi-stroke dictionary against recent history + current stroke
      const candidateChords = [
        ...strokeHistoryRef.current.slice(-3).map((r) => r.chord),
        result.formattedChord,
      ];
      const multiMatch = lookupMultiStroke(candidateChords);

      if (multiMatch) {
        const priorStrokesToReplace = multiMatch.strokeCount - 1;
        const consumedRecords = strokeHistoryRef.current.slice(-priorStrokesToReplace);
        const replaceWordCount = consumedRecords.reduce((sum, r) => sum + r.wordCount, 0);
        const multiParts = multiMatch.word.split(/\s+/).filter(Boolean);

        strokeHistoryRef.current = [
          ...strokeHistoryRef.current.slice(0, strokeHistoryRef.current.length - priorStrokesToReplace),
          { chord: multiMatch.outline, wordCount: multiParts.length },
        ];
        setRecentChords(strokeHistoryRef.current.slice(-3).map((r) => r.chord));

        const newEntry: TapeEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          rawChord: formatChord(keys),
          formattedChord: result.formattedChord,
          translation: `${multiMatch.word} (${multiMatch.outline})`,
          columns,
          timestamp: Date.now(),
        };
        setTapeEntries((prev) => [...prev, newEntry]);

        setWords((prev) => [
          ...prev.slice(0, Math.max(0, prev.length - replaceWordCount)),
          ...multiParts,
        ]);

        if (onChordCommit) {
          onChordCommit(multiMatch.outline, multiMatch.word);
        }
        return;
      }

      // Standard single-stroke output
      const parts = result.word ? result.word.split(/\s+/).filter(Boolean) : [];
      if (parts.length > 0) {
        strokeHistoryRef.current = [
          ...strokeHistoryRef.current,
          { chord: result.formattedChord, wordCount: parts.length },
        ];
        if (strokeHistoryRef.current.length > 20) {
          strokeHistoryRef.current = strokeHistoryRef.current.slice(-20);
        }
        setRecentChords(strokeHistoryRef.current.slice(-3).map((r) => r.chord));
      }

      const newEntry: TapeEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        rawChord: formatChord(keys),
        formattedChord: result.formattedChord,
        translation: result.label,
        columns,
        timestamp: Date.now(),
      };
      setTapeEntries((prev) => [...prev, newEntry]);

      if (parts.length > 0) {
        setWords((prev) => [...prev, ...parts]);
      }

      if (onChordCommit) {
        onChordCommit(result.formattedChord, result.word);
      }
    },
    [onChordCommit]
  );

  // Direct commit of a specific key chord (used for Spacebar, Enter, or Stroke Chord button)
  const commitChord = useCallback(
    (customKeys?: number[]) => {
      const keysToCommit =
        customKeys !== undefined
          ? customKeys
          : pendingKeysRef.current.length > 0
          ? pendingKeysRef.current
          : Array.from(currentStrokeRef.current);

      commitKeys(keysToCommit);
    },
    [commitKeys]
  );

  // Toggle a key in pending keys (for on-screen clicking & Sticky Keys mode)
  const togglePendingKey = useCallback((stenoKeyIndex: number) => {
    stenoAudio.playKeyDown();
    setPendingKeys((prev) => {
      if (prev.includes(stenoKeyIndex)) {
        return prev.filter((k) => k !== stenoKeyIndex);
      } else {
        return [...prev, stenoKeyIndex].sort((a, b) => a - b);
      }
    });
  }, []);

  const clearPendingKeys = useCallback(() => {
    setPendingKeys([]);
  }, []);

  // Commit current stroke when all simultaneous sources release
  const commitStroke = useCallback(() => {
    const keys = Array.from(currentStrokeRef.current).sort((a, b) => a - b);
    commitKeys(keys);
  }, [commitKeys]);

  // Press a key/source
  const pressKey = useCallback((sourceId: string, stenoKeyIndex: number) => {
    if (activeSourcesRef.current.has(sourceId)) return;

    activeSourcesRef.current.set(sourceId, stenoKeyIndex);
    currentStrokeRef.current.add(stenoKeyIndex);

    stenoAudio.playKeyDown();
    setActiveKeys(Array.from(new Set(activeSourcesRef.current.values())));
  }, []);

  // Release a key/source
  const releaseKey = useCallback(
    (sourceId: string) => {
      if (!activeSourcesRef.current.delete(sourceId)) return;

      setActiveKeys(Array.from(new Set(activeSourcesRef.current.values())));

      if (activeSourcesRef.current.size === 0) {
        commitStroke();
      }
    },
    [commitStroke]
  );

  // Clear paper tape
  const clearTape = useCallback(() => {
    setTapeEntries([]);
  }, []);

  // Clear words
  const clearWords = useCallback(() => {
    strokeHistoryRef.current = [];
    setRecentChords([]);
    setWords([]);
  }, []);

  // Pop last word (backspace action)
  const popWord = useCallback(() => {
    if (strokeHistoryRef.current.length > 0) {
      const last = strokeHistoryRef.current[strokeHistoryRef.current.length - 1];
      if (last.wordCount > 1) {
        last.wordCount -= 1;
      } else {
        strokeHistoryRef.current.pop();
      }
      setRecentChords(strokeHistoryRef.current.slice(-3).map((r) => r.chord));
    }
    setWords((prev) => prev.slice(0, -1));
  }, []);

  // Global blur safety
  useEffect(() => {
    const handleBlur = () => {
      activeSourcesRef.current.clear();
      currentStrokeRef.current.clear();
      setActiveKeys([]);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  // Combined visual active keys (hardware keys + latched pending keys)
  const combinedActiveKeys = Array.from(new Set([...activeKeys, ...pendingKeys]));

  return {
    keyMap,
    activeKeys: combinedActiveKeys,
    hardwareActiveKeys: activeKeys,
    pendingKeys,
    recentChords,
    stickyMode,
    toggleStickyMode,
    togglePendingKey,
    clearPendingKeys,
    commitChord,
    words,
    tapeEntries,
    pressKey,
    releaseKey,
    clearTape,
    clearWords,
    popWord,
    updateKeyMap,
    resetKeyMap,
  };
}
