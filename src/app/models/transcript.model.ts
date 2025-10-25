export interface TranscriptData {
  meetingId: string;
  mentorName: string;
  date: Date;
  duration: number;
  transcript: string;
  summary: string;
  keyPoints: string[];
}

export interface SummaryData {
  title: string;
  overview: string;
  keyPoints: string[];
  actionItems: string[];
  nextSteps: string;
}

