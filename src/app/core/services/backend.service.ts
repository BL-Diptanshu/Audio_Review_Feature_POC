import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

export interface AudioUploadResponse {
  success: boolean;
  meetingId: string;
  transcript: string;
  summary: string;
  message?: string;
}

export interface MeetingData {
  meetingId: string;
  mentorId: string;
  mentorName: string;
  studentName: string;
  duration: number;
  startTime: Date;
  endTime?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BackendService {
  // TODO: Replace with your actual backend URL
  private backendUrl = 'http://localhost:8000/api'; // Change this to your backend URL
  private isConnected$ = new BehaviorSubject<boolean>(false);
  private connectionError$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    this.checkBackendConnection();
  }

  /**
   * Check if backend is connected
   */
  checkBackendConnection(): void {
    this.http.get(`${this.backendUrl}/health`, { responseType: 'text' })
      .pipe(
        timeout(5000),
        catchError(() => {
          this.isConnected$.next(false);
          this.connectionError$.next('Backend service not connected');
          return throwError(() => new Error('Backend not connected'));
        })
      )
      .subscribe(() => {
        this.isConnected$.next(true);
        this.connectionError$.next(null);
      });
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): Observable<boolean> {
    return this.isConnected$.asObservable();
  }

  /**
   * Get connection error message
   */
  getConnectionError(): Observable<string | null> {
    return this.connectionError$.asObservable();
  }

  /**
   * Upload audio file to backend for processing
   * @param audioBlob - Audio blob from recording
   * @param meetingData - Meeting information
   * @returns Observable with transcript and summary
   */
  uploadAudio(audioBlob: Blob, meetingData: MeetingData): Observable<AudioUploadResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, `meeting-${meetingData.meetingId}.wav`);
    formData.append('meetingId', meetingData.meetingId);
    formData.append('mentorId', meetingData.mentorId);
    formData.append('mentorName', meetingData.mentorName);
    formData.append('studentName', meetingData.studentName);
    formData.append('duration', meetingData.duration.toString());
    formData.append('startTime', meetingData.startTime.toISOString());

    return this.http.post<AudioUploadResponse>(
      `${this.backendUrl}/meetings/upload-audio`,
      formData,
      { reportProgress: true }
    ).pipe(
      timeout(120000), // 2 minute timeout for large files
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get meeting summary by ID
   * @param meetingId - Meeting ID
   * @returns Observable with meeting data
   */
  getMeetingSummary(meetingId: string): Observable<AudioUploadResponse> {
    return this.http.get<AudioUploadResponse>(
      `${this.backendUrl}/meetings/${meetingId}/summary`
    ).pipe(
      timeout(10000),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get all meetings for a student
   * @param studentName - Student name
   * @returns Observable with array of meetings
   */
  getStudentMeetings(studentName: string): Observable<MeetingData[]> {
    return this.http.get<MeetingData[]>(
      `${this.backendUrl}/meetings/student/${encodeURIComponent(studentName)}`
    ).pipe(
      timeout(10000),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Get all meetings for a mentor
   * @param mentorId - Mentor ID
   * @returns Observable with array of meetings
   */
  getMentorMeetings(mentorId: string): Observable<MeetingData[]> {
    return this.http.get<MeetingData[]>(
      `${this.backendUrl}/meetings/mentor/${mentorId}`
    ).pipe(
      timeout(10000),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Delete a meeting
   * @param meetingId - Meeting ID
   * @returns Observable with success status
   */
  deleteMeeting(meetingId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.backendUrl}/meetings/${meetingId}`
    ).pipe(
      timeout(10000),
      catchError(error => this.handleError(error))
    );
  }

  /**
   * Handle HTTP errors
   * @param error - HTTP error response
   * @returns Observable error
   */
  private handleError(error: HttpErrorResponse | any) {
    let errorMessage = 'Backend service not connected';

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        errorMessage = 'Backend service not connected. Please check your connection.';
        this.isConnected$.next(false);
        this.connectionError$.next(errorMessage);
      } else if (error.status === 400) {
        errorMessage = error.error?.message || 'Invalid request';
      } else if (error.status === 404) {
        errorMessage = 'Resource not found';
      } else if (error.status === 500) {
        errorMessage = 'Backend server error';
      }
    } else if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
      errorMessage = 'Request timeout - backend may be slow or unavailable';
      this.isConnected$.next(false);
      this.connectionError$.next(errorMessage);
    }

    console.error('Backend error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Set backend URL (useful for configuration)
   * @param url - Backend URL
   */
  setBackendUrl(url: string): void {
    this.backendUrl = url;
    this.checkBackendConnection();
  }

  /**
   * Get current backend URL
   * @returns Current backend URL
   */
  getBackendUrl(): string {
    return this.backendUrl;
  }
}

