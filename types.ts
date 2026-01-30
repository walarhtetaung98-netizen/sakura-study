export enum JLPTLevel {
  N5 = 'N5',
  N4 = 'N4'
}

export enum QuizType {
  KANJI = 'Kanji',
  VOCABULARY = 'Vocabulary',
  GRAMMAR = 'Grammar',
  READING = 'Reading'
}

export type AppMode = 'study' | 'quiz' | 'mock';

export interface Question {
  id: string;
  text: string;
  romaji: string;
  myanmarText: string;
  options: string[];
  correctIndex: number;
  explanation: string; // English explanation
  explanationMyanmar: string; // Myanmar explanation
  readings?: string[]; // For kanji questions
  section?: QuizType; // Optional: to identify section in mock tests
}

export interface StudyItem {
  id: string;
  mainText: string;
  subText: string; // Reading or connection rule
  romaji: string;
  meaningEnglish: string;
  meaningMyanmar: string;
  examples: {
    japanese: string;
    romaji: string;
    myanmar: string;
  }[];
  // Optional fields for Kanji/Grammar
  onyomi?: string;
  kunyomi?: string;
  strokeCount?: number;
  grammarExplanation?: string;
}

export interface UserStats {
  totalAnswered: number;
  correctAnswers: number;
  streak: number;
  levelProgress: {
    [key in JLPTLevel]: number; // 0-100 score roughly
  };
  dailyActivity: { date: string; count: number }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}