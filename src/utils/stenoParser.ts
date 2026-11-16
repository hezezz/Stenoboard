import {
  STENO_ORDER,
  NUM_MAP,
  BASE_DICT,
  PHRASING_DICT,
  INITIAL_ABBRS,
  FINAL_ABBRS,
  DERIVATIVE_RULES,
  INITIAL_CONSONANTS,
  FINAL_CONSONANTS,
} from '../data/stenoData';

export function formatChord(keys: number[]): string {
  const sorted = [...new Set(keys)].sort((a, b) => a - b);
  const part = (min: number, max: number) =>
    sorted
      .filter((i) => i >= min && i <= max)
      .map((i) => STENO_ORDER[i])
      .join('');

  const num = sorted.includes(0) ? '#' : '';
  const left = part(1, 7);
  const mid = part(8, 12); // A, O, *, E, U
  const right = part(13, 22);

  // If star key is pressed and no vowels, star is the mid
  const hasVowelOrStar = mid.length > 0;
  const hyphen = !hasVowelOrStar && right.length > 0 ? '-' : '';

  return num + left + mid + hyphen + right;
}

export const CHORD_ALIASES: Record<string, string> = {
  MR: 'PHR',
  MRS: 'PHRS',
  V: 'SR',
  NOV: 'TPHOF',
  AV: 'AF',
  GV: 'TKPW-F',
  SEV: 'SEF',
  VEN: 'SREPB',
  NV: 'TPH-F',
  TRIG: 'TREUG',
  SEMT: 'SEPLT',
  COMT: 'KOPLT',
  DOKMT: 'TKOPLT',
  AK: 'ABG',
  ANT: 'APBT',
  IS: 'EUS',
  IN: 'EUPB',
  IL: 'EUL',
  LAN: 'HRAPB',
  PH_PBL: 'PH-PBL',
};

export function parseChord(chordStr: string): number[] {
  const normalized = CHORD_ALIASES[chordStr] || chordStr;
  const result: number[] = [];
  let pos = 0;
  for (let i = 0; i < normalized.length; i++) {
    const c = normalized[i];
    if (c === '-') {
      pos = Math.max(pos, 13);
      continue;
    }
    const idx = STENO_ORDER.indexOf(c, pos);
    if (idx >= 0) {
      result.push(idx);
      pos = idx + 1;
    }
  }
  return result;
}

export function getTapeColumns(keys: number[]): string {
  const keySet = new Set(keys);
  return STENO_ORDER.split('')
    .map((char, idx) => (keySet.has(idx) ? char : ' '))
    .join(' ');
}

export interface TranslationResult {
  formattedChord: string;
  word: string;
  isCorrection: boolean;
  label: string;
}

export function translateChord(keys: number[]): TranslationResult {
  const sorted = [...new Set(keys)].sort((a, b) => a - b);
  if (sorted.length === 0) {
    return { formattedChord: '', word: '', isCorrection: false, label: '' };
  }

  const rawChord = formatChord(sorted);

  // Correction key: Star (*) alone
  if (sorted.length === 1 && sorted[0] === 10) {
    return {
      formattedChord: '*',
      word: '',
      isCorrection: true,
      label: 'Correction [Delete Word]',
    };
  }

  // 1. Number Bar Chords
  if (sorted[0] === 0 && sorted.length > 1) {
    const digits = sorted
      .slice(1)
      .map((k) => NUM_MAP[k])
      .filter(Boolean);
    if (digits.length === sorted.length - 1) {
      const numStr = digits.join('');
      return {
        formattedChord: rawChord,
        word: numStr,
        isCorrection: false,
        label: `Number ${numStr}`,
      };
    }
  }

  // 2. Exact match in Phrasing Dictionary (e.g. T-T -> "to the", S-T -> "is the")
  if (PHRASING_DICT[rawChord]) {
    return {
      formattedChord: rawChord,
      word: PHRASING_DICT[rawChord],
      isCorrection: false,
      label: `Phrase: ${PHRASING_DICT[rawChord]}`,
    };
  }

  // 3. Exact match in Base Dictionary
  if (BASE_DICT[rawChord]) {
    return {
      formattedChord: rawChord,
      word: BASE_DICT[rawChord],
      isCorrection: false,
      label: BASE_DICT[rawChord],
    };
  }

  // 4. Two-Abbreviation Single-Stroke Rule:
  // e.g. Initial T ("to") + Final -T ("the") => "to the"
  // e.g. Initial W ("with") + Final -T ("the") => "with the"
  // e.g. Initial K ("can") + Final -B ("be") => "can be"
  // e.g. Initial TP ("if") + Final -T ("the") => "if the"
  // e.g. Initial S ("is") + Final -T ("the") => "is the"
  // e.g. Initial HR ("will") + Final -B ("be") => "will be"
  const leftKeys = sorted.filter((k) => k >= 1 && k <= 7);
  const midKeys = sorted.filter((k) => k >= 8 && k <= 12);
  const rightKeys = sorted.filter((k) => k >= 13 && k <= 22);

  const leftStr = leftKeys.map((k) => STENO_ORDER[k]).join('');
  const midStr = midKeys.map((k) => STENO_ORDER[k]).join('');
  const rightStr = '-' + rightKeys.map((k) => STENO_ORDER[k]).join('');

  if (leftStr && rightKeys.length > 0) {
    const leftAbbr = INITIAL_ABBRS[leftStr];
    const rightAbbr = FINAL_ABBRS[rightStr];

    if (leftAbbr && rightAbbr && midStr === '') {
      const combined = `${leftAbbr} ${rightAbbr}`;
      return {
        formattedChord: rawChord,
        word: combined,
        isCorrection: false,
        label: `Dual Abbr: ${combined}`,
      };
    }
  }

  // 5. Morphological Derivatives Engine:
  // Check for Suffix -S (Plural/3rd person singular)
  if (sorted.includes(20) && sorted[sorted.length - 1] === 20) {
    const baseKeys = sorted.filter((k) => k !== 20);
    const baseChord = formatChord(baseKeys);
    const rule = DERIVATIVE_RULES.find((r) => r.baseChord === baseChord && r.hasPlural);
    if (rule) {
      const pluralWord = makePlural(rule.baseWord);
      return {
        formattedChord: rawChord,
        word: pluralWord,
        isCorrection: false,
        label: `Derivative (+S): ${pluralWord}`,
      };
    }
    if (BASE_DICT[baseChord]) {
      const pluralWord = makePlural(BASE_DICT[baseChord]);
      return {
        formattedChord: rawChord,
        word: pluralWord,
        isCorrection: false,
        label: `Derivative (+S): ${pluralWord}`,
      };
    }
  }

  // Check for Suffix -D (Past Tense)
  if (sorted.includes(21) && sorted[sorted.length - 1] === 21) {
    const baseKeys = sorted.filter((k) => k !== 21);
    const baseChord = formatChord(baseKeys);
    const rule = DERIVATIVE_RULES.find((r) => r.baseChord === baseChord && r.hasPast);
    if (rule) {
      const pastWord = makePastTense(rule.baseWord);
      return {
        formattedChord: rawChord,
        word: pastWord,
        isCorrection: false,
        label: `Derivative (+D): ${pastWord}`,
      };
    }
    if (BASE_DICT[baseChord]) {
      const pastWord = makePastTense(BASE_DICT[baseChord]);
      return {
        formattedChord: rawChord,
        word: pastWord,
        isCorrection: false,
        label: `Derivative (+D): ${pastWord}`,
      };
    }
  }

  // Check for Suffix -G (Present Participle -ing)
  if (sorted.includes(18) && sorted[sorted.length - 1] === 18) {
    const baseKeys = sorted.filter((k) => k !== 18);
    const baseChord = formatChord(baseKeys);
    const rule = DERIVATIVE_RULES.find((r) => r.baseChord === baseChord && r.hasProgressive);
    if (rule) {
      const ingWord = makeIngForm(rule.baseWord);
      return {
        formattedChord: rawChord,
        word: ingWord,
        isCorrection: false,
        label: `Derivative (+G -ing): ${ingWord}`,
      };
    }
    if (BASE_DICT[baseChord]) {
      const ingWord = makeIngForm(BASE_DICT[baseChord]);
      return {
        formattedChord: rawChord,
        word: ingWord,
        isCorrection: false,
        label: `Derivative (+G -ing): ${ingWord}`,
      };
    }
  }

  // Check for Suffix -PLT (-ment)
  if (rightStr === '-PLT' || rightStr.endsWith('PLT')) {
    const baseKeys = sorted.filter((k) => k !== 15 && k !== 17 && k !== 19);
    const baseChord = formatChord(baseKeys);
    const rule = DERIVATIVE_RULES.find((r) => r.baseChord === baseChord && r.hasMent);
    if (rule) {
      const mentWord = rule.baseWord + 'ment';
      return {
        formattedChord: rawChord,
        word: mentWord,
        isCorrection: false,
        label: `Derivative (-ment): ${mentWord}`,
      };
    }
  }

  // Check for Suffix -GS (-shun / -tion)
  if (rightStr === '-GS' || rightStr.endsWith('GS')) {
    const baseKeys = sorted.filter((k) => k !== 18 && k !== 20);
    const baseChord = formatChord(baseKeys);
    const rule = DERIVATIVE_RULES.find((r) => r.baseChord === baseChord && r.hasShun);
    if (rule) {
      const shunWord = rule.baseWord;
      return {
        formattedChord: rawChord,
        word: shunWord,
        isCorrection: false,
        label: `Derivative (-shun): ${shunWord}`,
      };
    }
  }

  // 6. Consonant / Vowel Compound Assembly fallback
  const initialName = INITIAL_CONSONANTS[leftStr] || leftStr;
  const finalName = FINAL_CONSONANTS[rightStr] || rightStr;
  const labelParts = [initialName, midStr, finalName].filter(Boolean).join('');

  return {
    formattedChord: rawChord,
    word: `[${rawChord}]`,
    isCorrection: false,
    label: labelParts || rawChord,
  };
}

function makePlural(word: string): string {
  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x')) {
    return word + 'es';
  }
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ies';
  }
  return word + 's';
}

function makePastTense(word: string): string {
  if (word === 'take') return 'took';
  if (word === 'bring') return 'brought';
  if (word === 'think') return 'thought';
  if (word.endsWith('e')) return word + 'd';
  if (word.endsWith('y') && !/[aeiou]y$/i.test(word)) {
    return word.slice(0, -1) + 'ied';
  }
  return word + 'ed';
}

function makeIngForm(word: string): string {
  if (word === 'take') return 'taking';
  if (word === 'save') return 'saving';
  if (word === 'live') return 'living';
  if (word === 'drive') return 'driving';
  if (word === 'file') return 'filing';
  if (word === 'advertise') return 'advertising';
  if (word === 'organize') return 'organizing';
  if (word.endsWith('e') && !word.endsWith('ee')) {
    return word.slice(0, -1) + 'ing';
  }
  return word + 'ing';
}

export function formatKeyCode(code: string): string {
  const map: Record<string, string> = {
    Semicolon: ';',
    Quote: "'",
    BracketLeft: '[',
    BracketRight: ']',
    Comma: ',',
    Period: '.',
    Slash: '/',
    Backslash: '\\',
    Minus: '-',
    Equal: '=',
    Backquote: '`',
    Space: '␣',
  };
  if (map[code]) return map[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  return code;
}

export function isChordOrWordMatch(
  committedChord: string,
  translatedWord: string,
  expectedChord: string,
  expectedWord: string
): boolean {
  if (committedChord === expectedChord) return true;

  // Normalized chord match (strip hyphens)
  const normCommitted = committedChord.replace(/-/g, '');
  const normExpected = expectedChord.replace(/-/g, '');
  if (normCommitted === normExpected && normExpected.length > 0) return true;

  // Equivalent chord representations across curriculum modules
  const equivMap: Record<string, string[]> = {
    T: ['T', '-T'],
    '-T': ['T', '-T'],
    S: ['S', '-S'],
    '-S': ['S', '-S'],
    R: ['R', '-R'],
    '-R': ['R', '-R'],
    P: ['P', '-P'],
    '-P': ['P', '-P'],
    B: ['-B', 'PW', 'B'],
    '-B': ['-B', 'PW', 'B'],
    PW: ['-B', 'PW', 'B'],
    G: ['-G', 'TKPW', 'G'],
    '-G': ['-G', 'TKPW', 'G'],
    TKPW: ['-G', 'TKPW', 'G'],
    F: ['-F', 'TP', 'F'],
    '-F': ['-F', 'TP', 'F'],
    TP: ['-F', 'TP', 'F'],
    D: ['-D', 'TK', 'D'],
    '-D': ['-D', 'TK', 'D'],
    TK: ['-D', 'TK', 'D'],
    THURS: ['THUR', 'THURS'],
    THUR: ['THUR', 'THURS'],
    SKWRUPB: ['SKWRUPB', 'SKWRAOPB', 'SKWRU'],
    SKWRAOPB: ['SKWRUPB', 'SKWRAOPB', 'SKWRU'],
    SKWRU: ['SKWRUPB', 'SKWRAOPB', 'SKWRU'],
    'PR-G': ['PRG', 'PR-G'],
    PRG: ['PRG', 'PR-G'],
    'R-R': ['RR', 'R-R'],
    RR: ['RR', 'R-R'],
    'TPH-T': ['TPHT', 'TPH-T'],
    TPHT: ['TPHT', 'TPH-T'],
    'TPH-FR': ['TPHFR', 'TPH-FR'],
    TPHFR: ['TPHFR', 'TPH-FR'],
    'K-T': ['KT', 'K-T'],
    KT: ['KT', 'K-T'],
    'R-S': ['RS', 'R-S'],
    RS: ['RS', 'R-S'],
    'ST-S': ['STS', 'ST-S'],
    STS: ['STS', 'ST-S'],
    'P-T': ['PT', 'P-T'],
    PT: ['PT', 'P-T'],
    'HR-R': ['HRR', 'HR-R'],
    HRR: ['HRR', 'HR-R'],
    'T-T': ['TT', 'T-T'],
    TT: ['TT', 'T-T'],
    'S-T': ['ST', 'S-T'],
    ST: ['ST', 'S-T'],
    'W-T': ['WT', 'W-T'],
    WT: ['WT', 'W-T'],
    'K-B': ['KB', 'K-B'],
    KB: ['KB', 'K-B'],
    'HR-B': ['HRB', 'HR-B'],
    HRB: ['HRB', 'HR-B'],
    'TP-T': ['TPT', 'TP-T'],
    TPT: ['TPT', 'TP-T'],
    'OD-D': ['ODD', 'OD-D'],
    ODD: ['ODD', 'OD-D'],
    'TA-S': ['TAS', 'TA-S'],
    TAS: ['TAS', 'TA-S'],
    SAT: ['SAT', 'SA-T'],
    'SA-T': ['SAT', 'SA-T'],
    WED: ['WED', 'WE-D'],
    'WE-D': ['WED', 'WE-D'],
    MR: ['MR', 'PHR'],
    PHR: ['MR', 'PHR'],
    MRS: ['MRS', 'PHRS', 'PHR-S'],
    PHRS: ['MRS', 'PHRS', 'PHR-S'],
    'PHR-S': ['MRS', 'PHRS', 'PHR-S'],
    V: ['V', 'SR'],
    SR: ['V', 'SR'],
    NOV: ['NOV', 'TPHOF'],
    TPHOF: ['NOV', 'TPHOF'],
    AV: ['AV', 'AF'],
    AF: ['AV', 'AF'],
    GV: ['GV', 'TKPWF', 'TKPW-F'],
    TKPWF: ['GV', 'TKPWF', 'TKPW-F'],
    'TKPW-F': ['GV', 'TKPWF', 'TKPW-F'],
    SEV: ['SEV', 'SEF'],
    SEF: ['SEV', 'SEF'],
    VEN: ['VEN', 'SREPB'],
    SREPB: ['VEN', 'SREPB'],
    NV: ['NV', 'TPHF', 'TPH-F'],
    TPHF: ['NV', 'TPHF', 'TPH-F'],
    'TPH-F': ['NV', 'TPHF', 'TPH-F'],
    TRIG: ['TRIG', 'TREUG'],
    TREUG: ['TRIG', 'TREUG'],
    SEMT: ['SEMT', 'SEPLT'],
    SEPLT: ['SEMT', 'SEPLT'],
    COMT: ['COMT', 'KOPLT'],
    KOPLT: ['COMT', 'KOPLT'],
    DOKMT: ['DOKMT', 'TKOPLT', 'TKOBG'],
    TKOPLT: ['DOKMT', 'TKOPLT', 'TKOBG'],
    AK: ['AK', 'ABG'],
    ABG: ['AK', 'ABG'],
    ANT: ['ANT', 'APBT'],
    APBT: ['ANT', 'APBT'],
    IS: ['IS', 'EUS'],
    EUS: ['IS', 'EUS'],
    IN: ['IN', 'EUPB'],
    EUPB: ['IN', 'EUPB'],
    IL: ['IL', 'EUL'],
    EUL: ['IL', 'EUL'],
    LAN: ['LAN', 'HRAPB'],
    HRAPB: ['LAN', 'HRAPB'],
    PH_PBL: ['PH_PBL', 'PH-PBL'],
    'PH-PBL': ['PH_PBL', 'PH-PBL'],
  };

  if (equivMap[expectedChord]?.includes(committedChord)) return true;
  if (equivMap[committedChord]?.includes(expectedChord)) return true;

  // Check aliases from CHORD_ALIASES
  const canonicalExpected = CHORD_ALIASES[expectedChord] || expectedChord;
  const canonicalCommitted = CHORD_ALIASES[committedChord] || committedChord;
  if (canonicalExpected === committedChord || canonicalCommitted === expectedChord || canonicalExpected === canonicalCommitted) {
    return true;
  }

  // Word translation match (clean word ignoring case, punctuation, parentheticals, and multi-word definitions)
  const cleanTarget = expectedWord
    .replace(/\s*\([^)]*\)/g, '')
    .toLowerCase()
    .replace(/[.?,\!]/g, '')
    .trim();
  const cleanActual = translatedWord
    .replace(/\s*\([^)]*\)/g, '')
    .toLowerCase()
    .replace(/[.?,\!]/g, '')
    .trim();

  if (cleanTarget && cleanActual) {
    if (cleanActual === cleanTarget) return true;
    const targetParts = cleanTarget.split('/').map((s) => s.trim());
    if (targetParts.includes(cleanActual)) return true;
    const actualParts = cleanActual.split('/').map((s) => s.trim());
    if (actualParts.some((p) => targetParts.includes(p))) return true;

    // Check inflections (takes vs take, streets vs street, ordered vs order)
    if (cleanActual.startsWith(cleanTarget) || cleanTarget.startsWith(cleanActual)) {
      if (Math.abs(cleanActual.length - cleanTarget.length) <= 3) return true;
    }
  }

  return false;
}
