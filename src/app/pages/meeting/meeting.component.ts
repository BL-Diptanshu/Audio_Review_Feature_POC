import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AudioRecorderService, RecordingState } from '../../core/services/audio-recorder.service';
import { MeetingService } from '../../core/services/meeting.service';
import { MentorService } from '../../core/services/mentor.service';
import { BackendService } from '../../core/services/backend.service';
import { Meeting } from '../../models/meeting.model';
import { WaveformComponent } from '../../shared/waveform/waveform.component';

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
  audioUrl: string = '';
  isPlaying: boolean = false;
  audioPlayer: HTMLAudioElement | null = null;
  recordingDuration: number = 0;
  currentPlayTime: number = 0;
  isRecordingStopped: boolean = false;
  backendConnected: boolean = false;
  backendError: string | null = null;
  endMeetingError: string | null = null;

  private destroy$ = new Subject<void>();
  private mentorId: string = '';
  private timerInterval: any;
  private playbackInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private audioRecorder: AudioRecorderService,
    private meetingService: MeetingService,
    private mentorService: MentorService,
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
    // Monitor backend connection status
    this.backendService.getConnectionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe(connected => {
        this.backendConnected = connected;
      });

    this.backendService.getConnectionError()
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.backendError = error;
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
      });

    // Subscribe to audio data changes
    this.audioRecorder.getAudioData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(blob => {
        this.hasRecording = blob !== null;
      });
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
    }
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null;
    }
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
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
    this.audioUrl = '';
    this.isPlaying = false;
    this.recordingDuration = 0;
    this.currentPlayTime = 0;
    this.endMeetingError = null;

    // Stop any playing audio
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null;
    }

    // Revoke audio URL
    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
    }

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
    this.audioRecorder.stopRecording();
    // Capture the recording duration when stopping
    this.recordingDuration = this.recordingState.duration;
    this.isRecordingStopped = true;
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
   * Play recorded audio for preview
   */
  playAudio(): void {
    if (!this.audioPlayer) {
      this.audioRecorder.getAudioData()
        .pipe(takeUntil(this.destroy$))
        .subscribe(blob => {
          if (blob) {
            this.audioUrl = URL.createObjectURL(blob);
            this.audioPlayer = new Audio(this.audioUrl);
            this.audioPlayer.play();
            this.isPlaying = true;
            this.startPlaybackTracking();
          }
        });
    } else {
      this.audioPlayer.play();
      this.isPlaying = true;
      this.startPlaybackTracking();
    }
  }

  /**
   * Pause audio playback
   */
  pauseAudio(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.isPlaying = false;
      this.stopPlaybackTracking();
    }
  }

  /**
   * Stop audio playback and reset
   */
  stopAudio(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      this.isPlaying = false;
      this.currentPlayTime = 0;
      this.stopPlaybackTracking();
    }
  }

  /**
   * Track audio playback progress
   */
  private startPlaybackTracking(): void {
    this.playbackInterval = setInterval(() => {
      if (this.audioPlayer) {
        this.currentPlayTime = Math.floor(this.audioPlayer.currentTime);
        if (this.audioPlayer.ended) {
          this.isPlaying = false;
          this.stopPlaybackTracking();
        }
      }
    }, 100);
  }

  /**
   * Stop tracking audio playback
   */
  private stopPlaybackTracking(): void {
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  /**
   * End meeting and process audio
   * Sends audio to backend for transcription and summarization
   */
  endMeeting(): void {
    if (!this.currentMeeting) return;

    // Check if backend is connected
    if (!this.backendConnected) {
      this.endMeetingError = 'Backend service not added';
      return;
    }

    this.isProcessing = true;
    this.endMeetingError = null;
    this.audioRecorder.getAudioData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(audioBlob => {
        if (audioBlob && this.currentMeeting) {
          // Save meeting immediately with placeholder data
          this.meetingService.saveMeeting(
            this.currentMeeting,
            'Processing transcript...',
            'Processing summary...'
          );

          // Send audio to backend
          this.uploadAudioToBackend(audioBlob, this.currentMeeting);
        } else {
          this.isProcessing = false;
          this.endMeetingError = 'No audio recording found. Please record audio before ending the meeting.';
        }
      });
  }

  /**
   * Upload audio file to backend
   * @param audioBlob - The audio blob to upload
   * @param meeting - The meeting object
   */
  private uploadAudioToBackend(audioBlob: Blob, meeting: Meeting): void {
    if (!this.backendConnected) {
      this.isProcessing = false;
      alert('Backend service not connected. Please check your connection and try again.');
      return;
    }

    const meetingData = {
      meetingId: meeting.id,
      mentorId: meeting.mentorId,
      mentorName: meeting.mentorName,
      studentName: this.studentName,
      duration: this.recordingDuration,
      startTime: meeting.startTime
    };

    console.log('Uploading audio to backend:', meetingData);

    // Call backend service to upload audio
    this.backendService.uploadAudio(audioBlob, meetingData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Backend response:', response);
          // Update the meeting with actual transcript and summary from backend
          this.meetingService.updateMeeting(
            meeting.id,
            response.transcript,
            response.summary
          );
          this.isProcessing = false;
          this.router.navigate(['/summary', meeting.id]);
        },
        error: (error) => {
          console.error('Backend upload error:', error);
          this.isProcessing = false;
          alert(`Failed to process meeting: ${error.message}`);
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

