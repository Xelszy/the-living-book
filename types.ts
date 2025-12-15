
export enum AppView {
  HOME = 'HOME',
  CREATE = 'CREATE',
  READING = 'READING',
  LIBRARY = 'LIBRARY',
}

export type Language = 'id' | 'en';
export type Subject = 'story' | 'math' | 'history' | 'science';

export interface MiniGame {
  type: 'quiz' | 'math_challenge';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StoryPage {
  pageNumber: number;
  text: string;
  imagePrompt: string;
  imageData?: string; // Base64 string
  audioData?: ArrayBuffer; // Raw PCM data
  isLoadingImage?: boolean;
}

export interface Story {
  id: string;
  title: string;
  theme: string;
  subject: Subject;
  language: Language;
  pages: StoryPage[];
  game: MiniGame;
  createdAt: number;
}

export interface StoryParams {
  character: string;
  setting: string;
  theme: string;
  subject: Subject;
  language: Language;
  customPrompt?: string;
}

export type GenerationStatus = 'idle' | 'writing' | 'illustrating' | 'narrating' | 'ready' | 'error';
