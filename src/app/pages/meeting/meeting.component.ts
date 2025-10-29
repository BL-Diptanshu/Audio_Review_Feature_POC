import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { AudioRecorderService, RecordingState } from '../../core/services/audio-recorder.service';
import { MeetingService } from '../../core/services/meeting.service';
import { MentorService } from '../../core/services/mentor.service';
import { BackendService } from '../../core/services/backend.service';
import { MockApiService } from '../../core/services/mock-api.service';
import { Meeting } from '../../models/meeting.model';
import { WaveformComponent } from '../../shared/waveform/waveform.component';
import { StopRecordingDialogComponent } from '../../shared/stop-recording-dialog/stop-recording-dialog.component';
import { ResponsePreviewDialogComponent } from '../../shared/response-preview-dialog/response-preview-dialog.component';
import { AudioPreviewDialogComponent } from '../../shared/audio-preview-dialog/audio-preview-dialog.component';

@Component({
  selector: 'app-meeting',
  standalone: true,
  imports: [CommonModule, WaveformComponent],
  templateUrl: './meeting.component.html',
  styleUrls: ['./meeting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MeetingComponent implements OnInit, OnDestroy {
  mentorName: string = '';
  studentName: string = '';
  recordingState: RecordingState = {
    isRecording: false,
    duration: 0,
    audioLevel: 0
  };
  hasRecording: boolean = false;
  isProcessing: boolean = false;
  currentTime = new Date();
  currentMeeting: Meeting | null = null;

  // Audio preview properties
  recordingDuration: number = 0;
  isRecordingStopped: boolean = false;
  backendConnected: boolean = false;
  backendError: string | null = null;
  endMeetingError: string | null = null;

  private destroy$ = new Subject<void>();
  private mentorId: string = '';
  private timerInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private audioRecorder: AudioRecorderService,
    private meetingService: MeetingService,
    private mentorService: MentorService,
    private backendService: BackendService,
    private mockApiService: MockApiService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Monitor backend connection status
    this.backendService.getConnectionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(connected => {
        this.backendConnected = connected;
        this.cdr.markForCheck();
      });

    this.backendService.getConnectionError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.backendError = error;
        this.cdr.markForCheck();
      });

    // Get mentor ID from route params
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      // Clear existing timer when route changes
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }

      // Reset all recording data for new meeting
      this.resetMeetingData();

      this.mentorId = params['mentorId'];
      const mentor = this.mentorService.getMentorById(this.mentorId);
      this.mentorName = mentor?.name || 'Unknown Mentor';
      this.currentMeeting = this.meetingService.createMeeting(this.mentorId, this.mentorName);

      // Add to active meetings (for simultaneous meeting support)
      if (this.currentMeeting) {
        this.meetingService.addActiveMeeting(this.currentMeeting);
      }

      // Start new timer for this meeting
      this.startTimer();
    });

    // Get student session data
    this.meetingService.getStudentSession()
      .pipe(takeUntil(this.destroy$))
      .subscribe(session => {
        if (session) {
          this.studentName = session.studentName;
        }
      });

    // Subscribe to recording state changes
    this.audioRecorder.getRecordingState()
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.recordingState = state;
        this.cdr.markForCheck();
      });

    // Subscribe to audio data changes
    this.audioRecorder.getAudioData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(blob => {
        this.hasRecording = blob !== null;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Reset all meeting data for new session
   */
  private resetMeetingData(): void {
    // Reset recording state
    this.recordingState = {
      isRecording: false,
      duration: 0,
      audioLevel: 0
    };

    // Reset audio preview
    this.hasRecording = false;
    this.isProcessing = false;
    this.isRecordingStopped = false;
    this.recordingDuration = 0;
    this.endMeetingError = null;

    // Reset audio recorder
    this.audioRecorder.resetRecording();
  }

  /**
   * Start audio recording from microphone
   */
  async startRecording(): Promise<void> {
    try {
      await this.audioRecorder.startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  }

  /**
   * Stop audio recording
   */
  stopRecording(): void {
    this.audioRecorder.pauseRecording();
    // Capture the recording duration when stopping
    this.recordingDuration = this.recordingState.duration;
    this.isRecordingStopped = true;
    this.cdr.markForCheck();

    // Show stop recording dialog
    const dialogRef = this.dialog.open(StopRecordingDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        recordingDuration: this.recordingDuration
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'resume') {
        this.isRecordingStopped = false;
        this.cdr.markForCheck();
        this.resumeRecording();
      } else if (result === 'preview') {
        this.showAudioPreview();
      }
    });
  }

  /**
   * Show audio preview in a dialog
   */
  private showAudioPreview(): void {
    // Get the current audio blob from the recorder
    const audioBlob = this.audioRecorder.getCurrentAudioBlob();

    if (audioBlob && audioBlob.size > 0) {
      const previewDialogRef = this.dialog.open(AudioPreviewDialogComponent, {
        width: '600px',
        disableClose: false,
        data: {
          audioBlob: audioBlob,
          recordingDuration: this.recordingDuration
        }
      });

      previewDialogRef.afterClosed().subscribe(() => {
        // Dialog closed, user can now resume or end meeting
        this.cdr.markForCheck();
      });
    } else {
      alert('No audio recording found. Please record audio before previewing.');
    }
  }

  /**
   * Resume recording after stop
   */
  async resumeRecording(): Promise<void> {
    try {
      this.isRecordingStopped = false;
      await this.audioRecorder.startRecording();
    } catch (error) {
      console.error('Failed to resume recording:', error);
      alert('Failed to resume recording. Please check microphone permissions.');
    }
  }



  /**
   * End meeting and process audio
   * Sends audio to backend API using FormData
   */
  endMeeting(): void {
    if (!this.currentMeeting) return;

    // Stop recording if still recording
    if (this.recordingState.isRecording) {
      this.audioRecorder.pauseRecording();
    }

    this.isProcessing = true;
    this.endMeetingError = null;
    this.recordingDuration = this.recordingState.duration;
    this.cdr.markForCheck();

    // Get current audio blob from recorded chunks
    const audioBlob = this.audioRecorder.getCurrentAudioBlob();

    if (audioBlob && audioBlob.size > 0 && this.currentMeeting) {
      // Send audio to backend API with FormData
      this.uploadAudioToBackend(audioBlob, this.currentMeeting);
    } else {
      this.isProcessing = false;
      this.endMeetingError = 'No audio recording found. Please record audio before ending the meeting.';
      this.cdr.markForCheck();
    }
  }

  /**
   * Upload audio file to backend API using FormData
   * @param audioBlob - The audio blob to upload
   * @param meeting - The meeting object
   */
  private uploadAudioToBackend(audioBlob: Blob, meeting: Meeting): void {
    const meetingData = {
      meetingId: meeting.id,
      mentorId: meeting.mentorId,
      mentorName: meeting.mentorName,
      studentName: this.studentName,
      duration: this.recordingDuration,
      startTime: meeting.startTime
    };

    console.log('Uploading audio to backend API with FormData:', meetingData);

    // Call mock API service to upload audio with FormData
    // TODO: This will be replaced with real backend API call
    this.mockApiService.uploadMeetingData(audioBlob, meetingData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Backend API response:', response);
          this.isProcessing = false;
          this.cdr.markForCheck();

          // Save meeting with response data
          this.meetingService.saveMeeting(
            meeting,
            response.responseSummary.transcript,
            `Meeting with ${response.responseSummary.mentorName} - ${response.responseSummary.meetingDuration}`
          );

          // Show response preview dialog
          const dialogRef = this.dialog.open(ResponsePreviewDialogComponent, {
            width: '600px',
            disableClose: true,
            data: response.responseSummary
          });

          dialogRef.afterClosed().subscribe(() => {
            // Navigate back to home after closing dialog
            this.router.navigate(['/']);
          });
        },
        error: (error) => {
          console.error('Backend API upload error:', error);
          this.isProcessing = false;
          this.endMeetingError = `Failed to process meeting: ${error.message}`;
          this.cdr.markForCheck();
        }
      });
  }

  /**
   * Start timer for current meeting
   * Updates current time every second
   */
  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      this.currentTime = new Date();
      this.cdr.markForCheck();
    }, 1000);
  }

  /**
   * Format seconds to HH:MM:SS format
   * @param seconds - Duration in seconds
   * @returns Formatted time string
   */
  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

