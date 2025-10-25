import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Meeting, MeetingSession } from '../../models/meeting.model';
import { TranscriptService } from './transcript.service';

export interface StudentSession {
  studentName: string;
  registrationNumber: string;
  batchId: string;
  emailId?: string;
  mentorId: string;
}

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  private meetings$ = new BehaviorSubject<MeetingSession[]>([]);
  private currentMeeting$ = new BehaviorSubject<Meeting | null>(null);
  private studentSession$ = new BehaviorSubject<StudentSession | null>(null);

  // Support for simultaneous meetings (40 mentors x 40 students)
  private activeMeetings = new Map<string, Meeting>();
  private maxConcurrentMeetings = 40;

  constructor(private transcriptService: TranscriptService) {
    this.loadMeetingsFromStorage();
  }

  createMeeting(mentorId: string, mentorName: string): Meeting {
    const meeting: Meeting = {
      id: `meeting-${Date.now()}`,
      mentorId,
      mentorName,
      startTime: new Date(),
      status: 'recording'
    };
    this.currentMeeting$.next(meeting);
    return meeting;
  }

  getCurrentMeeting(): Observable<Meeting | null> {
    return this.currentMeeting$.asObservable();
  }

  getMeetings(): Observable<MeetingSession[]> {
    return this.meetings$.asObservable();
  }

  /**
   * Store student session data
   * @param session - Student session information
   */
  setStudentSession(session: StudentSession): void {
    this.studentSession$.next(session);
  }

  /**
   * Get current student session
   * @returns Observable of student session
   */
  getStudentSession(): Observable<StudentSession | null> {
    return this.studentSession$.asObservable();
  }

  getMeetingById(id: string): MeetingSession | undefined {
    return this.meetings$.value.find(m => m.id === id);
  }

  /**
   * Process audio and generate transcript/summary using TranscriptService
   * TODO: In production, this would call the FastAPI backend with the audio blob
   *
   * @param audioBlob - Audio file blob from recording
   * @param meeting - Meeting object with mentor and student info
   * @returns Observable with transcript and summary
   */
  processMeetingAudio(audioBlob: Blob, meeting: Meeting): Observable<{ transcript: string; summary: string }> {
    // Get student session data to pass to transcript service
    const studentSession = this.studentSession$.value;
    const studentName = studentSession?.studentName || 'Student';

    // Call TranscriptService to process audio
    // TODO: Replace with actual FastAPI backend call
    return this.transcriptService.processAudio(audioBlob, meeting.mentorName, studentName)
      .pipe(
        switchMap(response => {
          return new Observable<{ transcript: string; summary: string }>(observer => {
            observer.next({
              transcript: response.transcript,
              summary: response.summary
            });
            observer.complete();
          });
        })
      );
  }

  /**
   * Reset current meeting data for new session
   * Clears the current meeting and student session
   */
  resetMeetingData(): void {
    this.currentMeeting$.next(null);
    this.studentSession$.next(null);
  }

  /**
   * Add meeting to active meetings (for simultaneous meeting support)
   * @param meeting - Meeting to add
   */
  addActiveMeeting(meeting: Meeting): void {
    if (this.activeMeetings.size < this.maxConcurrentMeetings) {
      this.activeMeetings.set(meeting.id, meeting);
    } else {
      console.warn('Maximum concurrent meetings reached (40)');
    }
  }

  /**
   * Remove meeting from active meetings
   * @param meetingId - ID of meeting to remove
   */
  removeActiveMeeting(meetingId: string): void {
    this.activeMeetings.delete(meetingId);
  }

  /**
   * Get count of active meetings
   * @returns Number of active meetings
   */
  getActiveMeetingCount(): number {
    return this.activeMeetings.size;
  }

  saveMeeting(meeting: Meeting, transcript: string, summary: string): void {
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - meeting.startTime.getTime()) / 1000);

    const session: MeetingSession = {
      id: meeting.id,
      mentorId: meeting.mentorId,
      mentorName: meeting.mentorName,
      startTime: meeting.startTime,
      endTime,
      duration,
      transcript,
      summary
    };

    const meetings = this.meetings$.value;
    meetings.unshift(session);
    this.meetings$.next(meetings);
    this.saveToStorage(meetings);

    // Remove from active meetings
    this.removeActiveMeeting(meeting.id);
  }

  /**
   * Update an existing meeting with new transcript and summary
   * @param meetingId - ID of the meeting to update
   * @param transcript - Updated transcript
   * @param summary - Updated summary
   */
  updateMeeting(meetingId: string, transcript: string, summary: string): void {
    const meetings = this.meetings$.value;
    const meetingIndex = meetings.findIndex(m => m.id === meetingId);

    if (meetingIndex !== -1) {
      meetings[meetingIndex] = {
        ...meetings[meetingIndex],
        transcript,
        summary
      };
      this.meetings$.next(meetings);
      this.saveToStorage(meetings);
    }
  }



  private saveToStorage(meetings: MeetingSession[]): void {
    try {
      localStorage.setItem('mentormeet_meetings', JSON.stringify(meetings));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  private loadMeetingsFromStorage(): void {
    try {
      const stored = localStorage.getItem('mentormeet_meetings');
      if (stored) {
        const meetings = JSON.parse(stored);
        this.meetings$.next(meetings);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }
}

