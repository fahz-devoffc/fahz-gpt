
export enum AppTab {
  LEARN = 'LEARN',
  PLAYGROUND = 'PLAYGROUND',
  TEMPLATES = 'TEMPLATES',
  CODE = 'CODE'
}

export interface Attachment {
  mimeType: string;
  data: string; // base64
  url: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  generatedImage?: string;
  generatedVideo?: string;
  isGenerating?: boolean;
}

export interface AIConfig {
  systemInstruction: string;
  temperature: number;
  model: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  systemInstruction: string;
  icon: string;
}
