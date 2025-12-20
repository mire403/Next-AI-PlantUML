export enum Tab {
  HISTORY = 'HISTORY',
  AI_GENERATOR = 'AI_GENERATOR',
  OPTIMIZATION = 'OPTIMIZATION',
  TUTORIAL = 'TUTORIAL'
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface GenerationResult {
  code: string;
  explanation: string;
}

export interface PlantUMLState {
  code: string;
  diagramUrl: string;
  isLoading: boolean;
  error: string | null;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  code: string;
}