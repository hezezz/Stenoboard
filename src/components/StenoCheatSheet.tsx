import React from 'react';
import { ChevronDown, BookOpen, Layers, Zap, Hash, AlertTriangle } from 'lucide-react';

export const StenoCheatSheet: React.FC = () => {
  return (
    <details className="group rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 md:p-5 shadow-lg transition-all duration-200">
      <summary className="flex cursor-pointer items-center justify-between font-bold text-sm md:text-base text-[var(--gold2)] list-none select-none">
        <span className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[var(--gold)]" />
          Machine Shorthand Rules & Keyboard Guide
        </span>
        <ChevronDown className="h-4 w-4 text-[var(--mut)] group-open:rotate-180 transition-transform duration-200" />
      </summary>

      <div className="mt-4 pt-3 border-t border-[var(--line)] text-xs md:text-sm text-[var(--mut)] space-y-3 leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel2)] p-3.5 space-y-2">
            <h4 className="font-bold text-[var(--ink)] flex items-center gap-1.5 font-mono-steno text-xs uppercase text-[var(--gold2)]">
              <Zap className="h-3.5 w-3.5" />
              1. How Steno Chording Works
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>A stroke is every key you hold simultaneously. It translates when you <strong>release all keys</strong>.</li>
              <li>Press whole words or phrases in one downward stroke of your fingers.</li>
              <li>Steno order reads left-to-right: <code className="text-[var(--gold2)]"># S T K P W H R A O * E U F R P B L G T S D Z</code>.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel2)] p-3.5 space-y-2">
            <h4 className="font-bold text-[var(--ink)] flex items-center gap-1.5 font-mono-steno text-xs uppercase text-[var(--gold2)]">
              <Zap className="h-3.5 w-3.5" />
              2. Dual Abbreviation Phrasing
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>You can type <strong>2 abbreviations at the same time</strong> using Initial and Final consonants in a single stroke!</li>
              <li>Initial <code className="text-[var(--gold2)]">T</code> (to) + Final <code className="text-[var(--gold2)]">-T</code> (the) = <strong className="text-[var(--ink)]">"to the"</strong> (<code className="text-[var(--gold2)]">T-T</code>).</li>
              <li>Initial <code className="text-[var(--gold2)]">W</code> (with) + Final <code className="text-[var(--gold2)]">-T</code> (the) = <strong className="text-[var(--ink)]">"with the"</strong> (<code className="text-[var(--gold2)]">W-T</code>).</li>
              <li>Initial <code className="text-[var(--gold2)]">S</code> (is) + Final <code className="text-[var(--gold2)]">-T</code> (the) = <strong className="text-[var(--ink)]">"is the"</strong> (<code className="text-[var(--gold2)]">S-T</code>).</li>
              <li>Initial <code className="text-[var(--gold2)]">K</code> (can) + Final <code className="text-[var(--gold2)]">-B</code> (be) = <strong className="text-[var(--ink)]">"can be"</strong> (<code className="text-[var(--gold2)]">K-B</code>).</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel2)] p-3.5 space-y-2">
            <h4 className="font-bold text-[var(--ink)] flex items-center gap-1.5 font-mono-steno text-xs uppercase text-[var(--gold2)]">
              <Layers className="h-3.5 w-3.5" />
              3. Morphological Derivatives
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-[var(--ink)]">Plurals / 3rd Person (-S):</strong> Add <code className="text-[var(--gold2)]">-S</code> to a brief (e.g., <code className="text-[var(--gold2)]">TA</code> take + <code className="text-[var(--gold2)]">-S</code> = <code className="text-[var(--gold2)]">TAS</code> takes; <code className="text-[var(--gold2)]">ST</code> street + <code className="text-[var(--gold2)]">-S</code> = <code className="text-[var(--gold2)]">STS</code> streets).</li>
              <li><strong className="text-[var(--ink)]">Past Tense (-D):</strong> Add <code className="text-[var(--gold2)]">-D</code> in the same stroke (e.g., <code className="text-[var(--gold2)]">PURD</code> purchased, <code className="text-[var(--gold2)]">OD-D</code> ordered).</li>
              <li><strong className="text-[var(--ink)]">Progressive (-G):</strong> Final <code className="text-[var(--gold2)]">-G</code> for words ending in -ing (e.g., <code className="text-[var(--gold2)]">PAG</code> paying, <code className="text-[var(--gold2)]">TRIG</code> trying, <code className="text-[var(--gold2)]">TAG</code> taking).</li>
              <li><strong className="text-[var(--ink)]">Suffixes:</strong> <code className="text-[var(--gold2)]">-MT</code> (-PLT) for -ment (<code className="text-[var(--gold2)]">DOKMT</code> document), <code className="text-[var(--gold2)]">-GS</code> for -shun (<code className="text-[var(--gold2)]">OGS</code> ocean).</li>
            </ul>
          </div>

          <div className="rounded-xl border border-[var(--line)] bg-[var(--panel2)] p-3.5 space-y-2">
            <h4 className="font-bold text-[var(--ink)] flex items-center gap-1.5 font-mono-steno text-xs uppercase text-[var(--gold2)]">
              <Hash className="h-3.5 w-3.5" />
              4. Numbers & Special Keys
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-[var(--ink)]">Number Bar (#):</strong> Depress any number key (1-0) along with upper keys: <code className="text-[var(--gold2)]">#S</code>=1, <code className="text-[var(--gold2)]">#T</code>=2, <code className="text-[var(--gold2)]">#P</code>=3, <code className="text-[var(--gold2)]">#H</code>=4, <code className="text-[var(--gold2)]">#A</code>=5, <code className="text-[var(--gold2)]">#F</code>=6, <code className="text-[var(--gold2)]">#P</code>=7, <code className="text-[var(--gold2)]">#L</code>=8, <code className="text-[var(--gold2)]">#T</code>=9, <code className="text-[var(--gold2)]">#O</code>=0.</li>
              <li><strong className="text-[var(--ink)]">Punctuation:</strong> Period = <code className="text-[var(--gold2)]">FPLT</code>, Comma = <code className="text-[var(--gold2)]">RBGS</code>, Question Mark = <code className="text-[var(--gold2)]">STPH</code>.</li>
              <li><strong className="text-[var(--ink)]">Star (*) alone:</strong> Deletes the previous word like a typewriter correction stamp.</li>
            </ul>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-black/40 border border-[var(--line)] flex items-start gap-2.5 text-[11px] text-[var(--mut)]">
          <AlertTriangle className="h-4 w-4 text-[var(--gold2)] shrink-0 mt-0.5" />
          <span>
            <strong className="text-[var(--ink)]">Hardware Key Rollover Note:</strong> Standard laptop keyboards typically register 4 to 6 simultaneous keys (2KRO/6KRO). If chords drop keys when pressed together, a gaming keyboard with N-Key Rollover (NKRO) or touchscreen multi-touch delivers 100% simultaneous input fidelity.
          </span>
        </div>
      </div>
    </details>
  );
};
