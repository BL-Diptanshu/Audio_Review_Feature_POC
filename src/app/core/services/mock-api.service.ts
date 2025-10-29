import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, catchError } from 'rxjs/operators';

export interface MockApiResponse {
  status: string;
  message: string;
  responseSummary: {
    mentorName: string;
    meetingDuration: string;
    transcript: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MockApiService {
  // TODO: Replace with actual backend API endpoint
  private apiUrl = 'http://localhost:3000/api/meetings/upload';

  constructor(private http: HttpClient) {}

  /**
   * Upload meeting data with audio file using FormData
   * Sends audio blob and meeting metadata to backend API
   *
   * @param audioBlob - Audio blob from recording
   * @param meetingData - Meeting information
   * @returns Observable with mock API response
   */
  uploadMeetingData(audioBlob: Blob, meetingData: any): Observable<MockApiResponse> {
    // Create FormData to send audio file and metadata
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('meetingId', meetingData.meetingId);
    formData.append('mentorId', meetingData.mentorId);
    formData.append('mentorName', meetingData.mentorName);
    formData.append('studentName', meetingData.studentName);
    formData.append('duration', meetingData.duration.toString());
    formData.append('startTime', meetingData.startTime);

    console.log('Sending FormData to backend:', {
      audio: 'Blob',
      meetingId: meetingData.meetingId,
      mentorId: meetingData.mentorId,
      mentorName: meetingData.mentorName,
      studentName: meetingData.studentName,
      duration: meetingData.duration,
      startTime: meetingData.startTime
    });

    // TODO: Replace with actual HTTP POST call
    // return this.http.post<MockApiResponse>(this.apiUrl, formData);

    // For now, return mock response after delay to simulate API processing
    const mockResponse: MockApiResponse = {
      status: 'success',
      message: 'Meeting data and audio uploaded successfully.',
      responseSummary: {
        mentorName: meetingData.mentorName || 'John Doe',
        meetingDuration: this.formatDuration(meetingData.duration),
        transcript: this.generateMockTranscript(meetingData.mentorName, meetingData.studentName)
      }
    };

    return of(mockResponse).pipe(delay(2500));
  }

  /**
   * Format duration from seconds to readable format
   * @param seconds - Duration in seconds
   * @returns Formatted duration string (e.g., "32 mins")
   */
  private formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) {
      return `${secs}s`;
    }
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }

  /**
   * Generate a mock transcript based on mentor and student names
   * @param mentorName - Name of the mentor
   * @param studentName - Name of the student
   * @returns Mock transcript text
   */
  private generateMockTranscript(mentorName: string, studentName: string): string {
    return `Sample transcript summary of the recorded session between ${mentorName} and ${studentName}. ` +
           `The discussion covered key topics related to academic progress, career guidance, and personal development. ` +
           `Action items were identified for follow-up in the next session.`;
  }
}

