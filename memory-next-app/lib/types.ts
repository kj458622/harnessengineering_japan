export type KanjiNote = {
  kanji: string;
  koreanSound: string;
  meaning: string;
  easyStory: string;
  components?: KanjiComponent[];
  meaningFlow?: string;
};

export type KanjiComponent = {
  shape: string;
  name: string;
  meaning: string;
  role: string;
};

export type ReviewState = {
  status: "new" | "remembered" | "confused";
  intervalDays: number;
  lastReviewedAt: string | null;
  nextReviewAt: string;
  remembered: number;
  confused: number;
};

export type WordCard = {
  id: string;
  expression: string;
  reading: string;
  romaji: string;
  meaningKo: string;
  partOfSpeech: string;
  soundKo: string;
  mnemonic: string;
  easyExplanation: string;
  kanjiNotes: KanjiNote[];
  pronunciationNote: string;
  exampleJa: string;
  exampleReading: string;
  exampleKo: string;
  source: "ai" | "jlpt" | "user" | "mock";
  jlptLevel?: "N5" | "N4" | "N3" | "N2" | "N1";
  note?: string;
  createdAt: string;
  updatedAt: string;
  review: ReviewState;
};

export type GeneratedCardPayload = Omit<WordCard, "id" | "createdAt" | "updatedAt" | "review" | "note">;
