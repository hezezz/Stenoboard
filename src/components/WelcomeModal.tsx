import React from 'react';
import { X, Sparkles, BookOpen, Layers, Zap, Calendar, MapPin, Hash, Check } from 'lucide-react';
import { QuizCategory } from '../types/steno';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (category: QuizCategory) => void;
  onStartFreeType: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  onStartFreeType,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--line-light)] bg-[var(--panel)] p-6 md:p-8 shadow-2xl text-[var(--ink)]">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close welcome guide"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--line)] bg-[var(--panel2)] text-[var(--mut)] hover:border-[var(--gold)] hover:text-[var(--gold2)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--gold-bg)] border border-[var(--line-light)] text-[var(--gold2)] font-mono-steno text-xs uppercase tracking-wider font-semibold mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shadow-[0_0_8px_var(--gold)]" />
            Machine Shorthand Tutor & Keyboard
          </div>
          <h2 id="welcome-modal-title" className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--gold2)] font-sans">
            Welcome to Stenoboard
          </h2>
          <p className="mt-2 text-sm md:text-base text-[var(--mut)] leading-relaxed">
            Stenoboard turns your standard laptop keyboard into a professional Machine Shorthand machine. Press several keys simultaneously and release them together to output syllables, full words, and high-speed phrases.
          </p>
        </div>

        {/* Feature Highlights & Quick Start */}
        <div className="space-y-4 mb-6">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel2)] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--gold2)] font-mono-steno flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-[var(--gold)]" />
              Key Rules & Capabilities
            </h3>
            <ul className="text-xs md:text-sm text-[var(--mut)] space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-[var(--ink)]">Single-Stroke Chording:</strong> Press all letters in a chord at the same time and release together to stamp a stroke.
              </li>
              <li>
                <strong className="text-[var(--ink)]">Dual Abbreviation Strokes:</strong> Write 2 abbreviations at once! Initial key + Final key in one stroke (e.g. initial <code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">T</code> + final <code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">-T</code> outputs <code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">"to the"</code>).
              </li>
              <li>
                <strong className="text-[var(--ink)]">Curriculum Derivatives:</strong> Add <code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">-S</code> for plurals (<code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">TAS</code> = takes), <code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">-D</code> for past tense (<code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">PURD</code> = purchased), and <code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">-G</code> for <code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">-ing</code> (<code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">PAG</code> = paying).
              </li>
              <li>
                <strong className="text-[var(--ink)]">Correction Key (*):</strong> Press Star on its own (<code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">T</code>, <code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">G</code>, <code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">Y</code>, or <code className="text-[var(--gold2)] bg-black/40 px-1 py-0.5 rounded">H</code>) to delete the previous word.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel2)] p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--gold2)] font-mono-steno flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-[var(--gold)]" />
              Standard Laptop Home Keys
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-mono-steno">
              <div className="p-2 rounded bg-black/30 border border-[var(--line)]">
                <span className="text-[var(--mut)] block text-[10px]">LEFT HAND TOP</span>
                <span className="text-[var(--gold2)] font-bold">Q W E R</span>
                <span className="text-[var(--ink)] text-[11px] block">S T P H</span>
              </div>
              <div className="p-2 rounded bg-black/30 border border-[var(--line)]">
                <span className="text-[var(--mut)] block text-[10px]">LEFT HAND HOME</span>
                <span className="text-[var(--gold2)] font-bold">A S D F</span>
                <span className="text-[var(--ink)] text-[11px] block">S K W R</span>
              </div>
              <div className="p-2 rounded bg-black/30 border border-[var(--line)]">
                <span className="text-[var(--mut)] block text-[10px]">RIGHT HAND TOP</span>
                <span className="text-[var(--gold2)] font-bold">U I O P [</span>
                <span className="text-[var(--ink)] text-[11px] block">F P L T D</span>
              </div>
              <div className="p-2 rounded bg-black/30 border border-[var(--line)]">
                <span className="text-[var(--mut)] block text-[10px]">THUMBS & NUM</span>
                <span className="text-[var(--gold2)] font-bold">C V & N M</span>
                <span className="text-[var(--ink)] text-[11px] block">A O & E U (# 1-0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launch Drills */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--mut)] font-mono-steno mb-3">
            Choose a Practice Module or Drill
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                onSelectMode('sentence');
                onClose();
              }}
              className="flex items-start gap-3 p-3 text-left rounded-xl border border-[var(--line)] bg-[var(--panel2)] hover:border-[var(--gold)] hover:bg-[var(--gold-bg)] transition-all group"
            >
              <div className="p-2 rounded-lg bg-[var(--gold-bg)] text-[var(--gold2)]">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--gold2)] block">
                  Sentence Practice
                </span>
                <span className="text-xs text-[var(--mut)]">
                  30 full sentences with word-by-word visual guides.
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectMode('phrasing');
                onClose();
              }}
              className="flex items-start gap-3 p-3 text-left rounded-xl border border-[var(--line)] bg-[var(--panel2)] hover:border-[var(--gold)] hover:bg-[var(--gold-bg)] transition-all group"
            >
              <div className="p-2 rounded-lg bg-[var(--gold-bg)] text-[var(--gold2)]">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--gold2)] block">
                  Dual-Abbreviation Phrasing
                </span>
                <span className="text-xs text-[var(--mut)]">
                  Drill "to the", "with the", "did you", "is the", etc.
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectMode('derivatives');
                onClose();
              }}
              className="flex items-start gap-3 p-3 text-left rounded-xl border border-[var(--line)] bg-[var(--panel2)] hover:border-[var(--gold)] hover:bg-[var(--gold-bg)] transition-all group"
            >
              <div className="p-2 rounded-lg bg-[var(--gold-bg)] text-[var(--gold2)]">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--gold2)] block">
                  Derivatives Engine
                </span>
                <span className="text-xs text-[var(--mut)]">
                  Practice base briefs with -S, -D, -G, -MT, and -GS suffixes.
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectMode('abbr');
                onClose();
              }}
              className="flex items-start gap-3 p-3 text-left rounded-xl border border-[var(--line)] bg-[var(--panel2)] hover:border-[var(--gold)] hover:bg-[var(--gold-bg)] transition-all group"
            >
              <div className="p-2 rounded-lg bg-[var(--gold-bg)] text-[var(--gold2)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--gold2)] block">
                  Core Abbreviations & Briefs
                </span>
                <span className="text-xs text-[var(--mut)]">
                  70+ standard shorthand briefs (doctor, lawyer, etc.).
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectMode('days');
                onClose();
              }}
              className="flex items-start gap-3 p-3 text-left rounded-xl border border-[var(--line)] bg-[var(--panel2)] hover:border-[var(--gold)] hover:bg-[var(--gold-bg)] transition-all group"
            >
              <div className="p-2 rounded-lg bg-[var(--gold-bg)] text-[var(--gold2)]">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--gold2)] block">
                  Days of the Week
                </span>
                <span className="text-xs text-[var(--mut)]">
                  Sunday through Saturday machine shorthand outlines.
                </span>
              </div>
            </button>

            <button
              onClick={() => {
                onSelectMode('provinces');
                onClose();
              }}
              className="flex items-start gap-3 p-3 text-left rounded-xl border border-[var(--line)] bg-[var(--panel2)] hover:border-[var(--gold)] hover:bg-[var(--gold-bg)] transition-all group"
            >
              <div className="p-2 rounded-lg bg-[var(--gold-bg)] text-[var(--gold2)]">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-[var(--ink)] group-hover:text-[var(--gold2)] block">
                  Philippine Provinces
                </span>
                <span className="text-xs text-[var(--mut)]">
                  Official briefs for Aklan, Antique, Capiz, Cebu, etc.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[var(--line)]">
          <button
            onClick={() => {
              onStartFreeType();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[var(--line)] bg-[var(--panel2)] text-sm font-semibold text-[var(--ink)] hover:border-[var(--gold)] hover:text-[var(--gold2)] transition-colors"
          >
            Free Typing Mode
          </button>
          <button
            onClick={() => {
              onSelectMode('sentence');
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-gradient-to-r from-[var(--gold2)] to-[var(--gold)] text-sm font-bold text-[var(--onink)] shadow-[0_0_16px_var(--gold-glow)] hover:opacity-95 transition-opacity"
          >
            Start Guided Practice
          </button>
        </div>
      </div>
    </div>
  );
};
