import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Keyboard,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useStenoEngine } from './hooks/useStenoEngine';
import { StenoboardKeyboard } from './components/StenoboardKeyboard';
import { PaperTape } from './components/PaperTape';
import { TextOutput } from './components/TextOutput';
import { PracticeDrill } from './components/PracticeDrill';
import { WelcomeModal } from './components/WelcomeModal';
import { KeyMappingDrawer } from './components/KeyMappingDrawer';
import { StenoCheatSheet } from './components/StenoCheatSheet';
import {
  QuizCategory,
  PracticeItem,
} from './types/steno';
import {
  SENTENCES,
  ABBREVIATIONS_LIST,
  DERIVATIVES_LIST,
  PHRASING_LIST,
  DAYS_OF_WEEK,
  MONTHS,
  PHILIPPINE_PROVINCES,
  BASE_DICT,
} from './data/stenoData';
import { parseChord, isChordOrWordMatch } from './utils/stenoParser';
import { stenoAudio } from './utils/audio';

export default function App() {
  // Hints visibility
  const [showHints, setShowHints] = useState<boolean>(true);

  // Practice mode toggle
  const [practiceActive, setPracticeActive] = useState<boolean>(false);
  const [quizCategory, setQuizCategory] = useState<QuizCategory>('sentence');
  const [showKeysHint, setShowKeysHint] = useState<boolean>(true);

  // Drill state
  const [sentenceIndex, setSentenceIndex] = useState<number>(0);
  const [sentenceWordIndex, setSentenceWordIndex] = useState<number>(0);
  const [randomItem, setRandomItem] = useState<{ chord: string; word: string } | null>(null);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [flashState, setFlashState] = useState<'good' | 'bad' | null>(null);

  // Modals & Drawers
  const [welcomeOpen, setWelcomeOpen] = useState<boolean>(false);
  const [keyMapDrawerOpen, setKeyMapDrawerOpen] = useState<boolean>(false);

  // Always keep app strictly in dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.dataset.theme = 'dark';
    try {
      localStorage.setItem('stenoboard_theme', 'dark');
    } catch {}
  }, []);

  // First-time visit detection for welcome guide modal
  useEffect(() => {
    try {
      const seen = localStorage.getItem('stenoboard_seen_guide');
      if (!seen) {
        setWelcomeOpen(true);
      }
    } catch {
      setWelcomeOpen(true);
    }
  }, []);

  const closeWelcomeModal = () => {
    setWelcomeOpen(false);
    try {
      localStorage.setItem('stenoboard_seen_guide', 'true');
    } catch {}
  };

  // Generate current practice item
  const currentItem = useMemo<PracticeItem | null>(() => {
    if (!practiceActive) return null;

    if (quizCategory === 'sentence') {
      const s = SENTENCES[sentenceIndex % SENTENCES.length];
      const cur = s.items[sentenceWordIndex % s.items.length];
      return {
        id: `s-${sentenceIndex}-${sentenceWordIndex}`,
        targetChord: cur.s,
        displayWord: cur.w,
        category: 'sentence',
        hintLabel: cur.w,
        sentenceWords: s.items.map((i) => ({ word: i.w, chord: i.s })),
      };
    }

    if (randomItem) {
      return {
        id: `r-${randomItem.chord}`,
        targetChord: randomItem.chord,
        displayWord: randomItem.word,
        category: quizCategory,
        hintLabel: randomItem.word,
      };
    }

    return null;
  }, [practiceActive, quizCategory, sentenceIndex, sentenceWordIndex, randomItem]);

  // Pick next random drill item
  const pickNextRandom = useCallback((cat: QuizCategory) => {
    let pool: [string, string][] = [];
    if (cat === 'abbr') pool = ABBREVIATIONS_LIST;
    else if (cat === 'derivatives') pool = DERIVATIVES_LIST;
    else if (cat === 'phrasing') pool = PHRASING_LIST;
    else if (cat === 'days') pool = DAYS_OF_WEEK;
    else if (cat === 'months') pool = MONTHS;
    else if (cat === 'provinces') pool = PHILIPPINE_PROVINCES;
    else {
      pool = Object.entries(BASE_DICT).filter(([_, v]) => !/[.?,\!]/.test(v)) as [string, string][];
    }

    if (pool.length > 0) {
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      setRandomItem({ chord: chosen[0], word: chosen[1] });
    }
  }, []);

  // When changing category
  const handleSelectCategory = useCallback(
    (cat: QuizCategory) => {
      setQuizCategory(cat);
      setSentenceWordIndex(0);
      setSentenceIndex(0);
      setCorrectCount(0);
      setTotalAttempts(0);
      setStreak(0);
      if (cat !== 'sentence') {
        pickNextRandom(cat);
      }
    },
    [pickNextRandom]
  );

  // Initialize random item on mount if needed
  useEffect(() => {
    if (quizCategory !== 'sentence' && !randomItem) {
      pickNextRandom(quizCategory);
    }
  }, [quizCategory, randomItem, pickNextRandom]);

  // Handle chord commitment verification for drill
  const handleChordCommit = useCallback(
    (formattedChord: string, translatedWord: string) => {
      if (!practiceActive || !currentItem || formattedChord === '*') return;

      setTotalAttempts((prev) => prev + 1);
      const expected = currentItem.targetChord;

      // Check exact match, normalized chord match, curriculum equivalents, or word equivalence
      const isMatch = isChordOrWordMatch(
        formattedChord,
        translatedWord,
        expected,
        currentItem.displayWord
      );

      if (isMatch) {
        stenoAudio.playSuccess();
        setCorrectCount((prev) => prev + 1);
        setStreak((prev) => prev + 1);
        setFlashState('good');
        setTimeout(() => setFlashState(null), 350);

        if (quizCategory === 'sentence') {
          const s = SENTENCES[sentenceIndex % SENTENCES.length];
          if (sentenceWordIndex + 1 >= s.items.length) {
            setSentenceWordIndex(0);
            setSentenceIndex((prev) => (prev + 1) % SENTENCES.length);
          } else {
            setSentenceWordIndex((prev) => prev + 1);
          }
        } else {
          pickNextRandom(quizCategory);
        }
      } else {
        setStreak(0);
        setFlashState('bad');
        setTimeout(() => setFlashState(null), 350);
      }
    },
    [practiceActive, currentItem, quizCategory, sentenceIndex, sentenceWordIndex, pickNextRandom]
  );

  // Skip current drill item
  const handleSkip = useCallback(() => {
    setStreak(0);
    if (quizCategory === 'sentence') {
      const s = SENTENCES[sentenceIndex % SENTENCES.length];
      if (sentenceWordIndex + 1 >= s.items.length) {
        setSentenceWordIndex(0);
        setSentenceIndex((prev) => (prev + 1) % SENTENCES.length);
      } else {
        setSentenceWordIndex((prev) => prev + 1);
      }
    } else {
      pickNextRandom(quizCategory);
    }
  }, [quizCategory, sentenceIndex, sentenceWordIndex, pickNextRandom]);

  // Hook for the Steno engine
  const {
    keyMap,
    activeKeys,
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
  } = useStenoEngine(handleChordCommit);

  // Keyboard Event Listeners for Physical Laptop Keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if modifier keys or typing in an input
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (welcomeOpen || keyMapDrawerOpen) {
        if (e.key === 'Escape') {
          setWelcomeOpen(false);
          setKeyMapDrawerOpen(false);
        }
        return;
      }
      if (/INPUT|TEXTAREA/.test((e.target as HTMLElement)?.tagName || '')) return;

      // Escape clears pending latched chord keys
      if (e.key === 'Escape' && pendingKeys.length > 0) {
        e.preventDefault();
        clearPendingKeys();
        return;
      }

      // Spacebar or Enter to commit pending chord if any
      if (e.code === 'Space' || e.code === 'Enter') {
        if (pendingKeys.length > 0) {
          e.preventDefault();
          commitChord();
          return;
        }
      }

      const stenoKeyIndex = keyMap[e.code];
      if (stenoKeyIndex !== undefined) {
        e.preventDefault();
        if (stickyMode) {
          togglePendingKey(stenoKeyIndex);
        } else {
          pressKey(e.code, stenoKeyIndex);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (welcomeOpen || keyMapDrawerOpen || stickyMode) return;
      if (keyMap[e.code] !== undefined) {
        e.preventDefault();
        releaseKey(e.code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    keyMap,
    stickyMode,
    pressKey,
    releaseKey,
    togglePendingKey,
    clearPendingKeys,
    welcomeOpen,
    keyMapDrawerOpen,
    pendingKeys,
    commitChord,
  ]);

  // Target keys on keyboard during practice
  const targetKeys = useMemo<number[]>(() => {
    if (!practiceActive || !showKeysHint || !currentItem) return [];
    return parseChord(currentItem.targetChord);
  }, [practiceActive, showKeysHint, currentItem]);

  return (
    <div className="min-h-screen transition-colors duration-200">
      <main className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        {/* Header Tag & Title */}
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--gold-bg)] border border-[var(--line-light)] text-[var(--gold2)] font-mono-steno text-xs uppercase tracking-wider font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-[var(--gold)] shadow-[0_0_8px_var(--gold)]" />
            Machine Shorthand Chord System
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--gold2)] flex items-center gap-3">
            <span>Stenoboard</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[var(--mut)] max-w-2xl leading-relaxed">
            Press several keys together, then let go. Your laptop keyboard acts as a precision stenotype, chording strokes into words, derivatives, and phrases on the digital paper tape.
          </p>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <button
            onClick={() => {
              const next = !practiceActive;
              setPracticeActive(next);
              if (next && quizCategory !== 'sentence') {
                pickNextRandom(quizCategory);
              }
            }}
            aria-pressed={practiceActive}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all shadow-sm flex items-center gap-1.5 ${
              practiceActive
                ? 'bg-gradient-to-r from-[var(--gold2)] to-[var(--gold)] text-[var(--onink)] border-[var(--gold)] shadow-[0_0_16px_var(--gold-glow)]'
                : 'border-[var(--line)] bg-[var(--panel2)] text-[var(--ink)] hover:border-[var(--gold)] hover:text-[var(--gold2)]'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Practice mode</span>
          </button>

          <button
            onClick={() => setShowHints((prev) => !prev)}
            aria-pressed={showHints}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all shadow-sm flex items-center gap-1.5 ${
              showHints
                ? 'border-[var(--gold)] bg-[var(--gold-bg)] text-[var(--gold2)]'
                : 'border-[var(--line)] bg-[var(--panel2)] text-[var(--mut)] hover:text-[var(--ink)]'
            }`}
          >
            <span>Laptop hints</span>
          </button>

          <button
            onClick={() => setKeyMapDrawerOpen(true)}
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-[var(--line)] bg-[var(--panel2)] text-[var(--ink)] hover:border-[var(--gold)] hover:text-[var(--gold2)] transition-all shadow-sm flex items-center gap-1.5"
          >
            <Keyboard className="h-4 w-4 text-[var(--gold)]" />
            <span>Key map</span>
          </button>

          <button
            onClick={() => setWelcomeOpen(true)}
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-bold border border-[var(--line-light)] bg-transparent text-[var(--gold2)] hover:border-[var(--gold)] hover:bg-[var(--gold-bg)] transition-all shadow-sm flex items-center gap-1.5 ml-auto"
          >
            <BookOpen className="h-4 w-4" />
            <span>Guide & Quizzes</span>
          </button>
        </div>

        {/* Practice Drill Card (when Practice mode is active) */}
        {practiceActive && (
          <PracticeDrill
            category={quizCategory}
            onSelectCategory={handleSelectCategory}
            currentItem={currentItem}
            sentenceWordIndex={sentenceWordIndex}
            totalSentenceWords={currentItem?.sentenceWords?.length || 0}
            sentenceIndex={sentenceIndex}
            totalSentences={SENTENCES.length}
            showKeysHint={showKeysHint}
            onToggleShowKeys={() => setShowKeysHint((prev) => !prev)}
            onSkip={handleSkip}
            correctCount={correctCount}
            totalAttempts={totalAttempts}
            streak={streak}
            flashState={flashState}
          />
        )}

        {/* Input / Output Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-5">
          <div className="md:col-span-5 h-[280px]">
            <PaperTape entries={tapeEntries} onClear={clearTape} />
          </div>
          <div className="md:col-span-7 h-[280px]">
            <TextOutput
              words={words}
              onClear={clearWords}
              onBackspace={popWord}
            />
          </div>
        </div>

        {/* Interactive Stenotype Keyboard */}
        <StenoboardKeyboard
          activeKeys={activeKeys}
          pendingKeys={pendingKeys}
          recentChords={recentChords}
          stickyMode={stickyMode}
          targetKeys={targetKeys}
          showHints={showHints}
          keyMap={keyMap}
          onPress={pressKey}
          onRelease={releaseKey}
          onToggleStickyMode={toggleStickyMode}
          onTogglePendingKey={togglePendingKey}
          onCommitChord={commitChord}
          onClearPendingKeys={clearPendingKeys}
        />

        {/* Shorthand Rules & Cheatsheet Accordion */}
        <StenoCheatSheet />
      </main>

      {/* Welcome Landing Modal */}
      <WelcomeModal
        isOpen={welcomeOpen}
        onClose={closeWelcomeModal}
        onSelectMode={(cat) => {
          setPracticeActive(true);
          handleSelectCategory(cat);
        }}
        onStartFreeType={() => {
          setPracticeActive(false);
        }}
      />

      {/* Key Mapping Modal Drawer */}
      <KeyMappingDrawer
        isOpen={keyMapDrawerOpen}
        onClose={() => setKeyMapDrawerOpen(false)}
        keyMap={keyMap}
        onUpdateKeyMap={updateKeyMap}
        onResetKeyMap={resetKeyMap}
        activeKeys={activeKeys}
      />
    </div>
  );
}
