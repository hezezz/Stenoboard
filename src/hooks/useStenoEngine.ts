import { useState, useEffect, useRef, useCallback } from 'react';
import { TapeEntry, KeyMap } from '../types/steno';
import { DEFAULT_KEY_MAP } from '../data/stenoData';
import { formatChord, translateChord, getTapeColumns } from '../utils/stenoParser';
import { stenoAudio } from '../utils/audio';

const STORAGE_KEY_MAP = 'stenoboard_key_map';
const STORAGE_WORDS = 'stenoboard_words';

export function useStenoEngine(onChordCommit?: (chord: string, word: string) => void) {
  // Key mapping state
  const [keyMap, setKeyMap] = useState<KeyMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MAP);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...DEFAULT_KEY_MAP };
  });

  // Active sources (e.g. "KeyW" -> 2, "p1" -> 2)
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

  // Pending latched keys for mouse/click chord building
  const [pendingKeys, setPendingKeys] = useState<number[]>([]);

  // Direct commit of a specific key chord (used for Spacebar, Enter, or Stroke Chord button)
  const commitChord = useCallback(
    (customKeys?: number[]) => {
      const keysToCommit = customKeys !== undefined
        ? customKeys
        : pendingKeys.length > 0
        ? pendingKeys
        : Array.from(currentStrokeRef.current);

      const keys = Array.from(new Set(keysToCommit)).sort((a, b) => a - b);
      currentStrokeRef.current.clear();
      setPendingKeys([]);

      if (keys.length === 0) return;

      stenoAudio.playChordCommit();
      const result = translateChord(keys);
      const columns = getTapeColumns(keys);

      const newEntry: TapeEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        rawChord: formatChord(keys),
        formattedChord: result.formattedChord,
        translation: result.label,
        columns,
        timestamp: Date.now(),
      };

      setTapeEntries((prev) => [...prev, newEntry]);

      if (result.isCorrection) {
        setWords((prev) => prev.slice(0, -1));
      } else if (result.word) {
        // Split if two words are generated (e.g. "to the")
        const parts = result.word.split(' ');
        setWords((prev) => [...prev, ...parts]);
      }

      if (onChordCommit) {
        onChordCommit(result.formattedChord, result.word);
      }
    },
    [pendingKeys, onChordCommit]
  );

  // Toggle a key in pending keys (for on-screen clicking)
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

  // Commit current stroke when all sources release
  const commitStroke = useCallback(() => {
    const keys = Array.from(currentStrokeRef.current).sort((a, b) => a - b);
    currentStrokeRef.current.clear();

    if (keys.length === 0) return;

    stenoAudio.playChordCommit();
    const result = translateChord(keys);
    const columns = getTapeColumns(keys);

    const newEntry: TapeEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      rawChord: formatChord(keys),
      formattedChord: result.formattedChord,
      translation: result.label,
      columns,
      timestamp: Date.now(),
    };

    setTapeEntries((prev) => [...prev, newEntry]);

    if (result.isCorrection) {
      setWords((prev) => prev.slice(0, -1));
    } else if (result.word) {
      // Split if two words are generated (e.g. "to the")
      const parts = result.word.split(' ');
      setWords((prev) => [...prev, ...parts]);
    }

    if (onChordCommit) {
      onChordCommit(result.formattedChord, result.word);
    }
  }, [onChordCommit]);

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
    setWords([]);
  }, []);

  // Pop last word (backspace action)
  const popWord = useCallback(() => {
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

  // Combined visual active keys (hardware keys + mouse pending keys)
  const combinedActiveKeys = Array.from(new Set([...activeKeys, ...pendingKeys]));

  return {
    keyMap,
    activeKeys: combinedActiveKeys,
    hardwareActiveKeys: activeKeys,
    pendingKeys,
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
