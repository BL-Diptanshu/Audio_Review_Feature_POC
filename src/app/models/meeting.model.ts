export interface Meeting {
  id: string;
  mentorId: string;
  mentorName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  audioBlob?: Blob;
  audioUrl?: string;
  transcript?: string;
  summary?: string;
  status: 'recording' | 'processing' | 'completed';
}

export interface MeetingSession {
  id: string;
  mentorId: string;
  mentorName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  transcript: string;
  summary: string;
}

