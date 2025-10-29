import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface AudioPreviewDialogData {
  audioBlob: Blob;
  recordingDuration: number;
}

@Component({
  selector: 'app-audio-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="audio-preview-dialog">
      <div class="dialog-header">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        </svg>
        <h2>Audio Preview</h2>
      </div>

      <div class="dialog-content">
        <div class="duration-info">
          <span class="label">Recording Duration:</span>
          <span class="duration">{{ formatTime(data.recordingDuration) }}</span>
        </div>

        <div class="playback-controls">
          <div class="button-group">
            <button
              class="play-btn"
              (click)="playAudio()"
              [disabled]="isPlaying || !audioPlayer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              PLAY
            </button>
            <button
              class="pause-btn"
              (click)="pauseAudio()"
              [disabled]="!isPlaying || !audioPlayer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
              PAUSE
            </button>
            <button
              class="stop-btn"
              (click)="stopAudio()"
              [disabled]="!isPlaying || !audioPlayer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
              STOP
            </button>
          </div>

          <div class="playback-progress">
            <span class="current-time">{{ formatTime(currentPlayTime) }}</span>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="data.recordingDuration > 0 ? (currentPlayTime / data.recordingDuration) * 100 : 0"></div>
            </div>
            <span class="total-time">{{ formatTime(data.recordingDuration) }}</span>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn btn-primary" (click)="onClose()">
          CLOSE
        </button>
      </div>
    </div>
  `,
  styles: [`
    .audio-preview-dialog {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      max-width: 600px;
      text-align: center;
    }

    .dialog-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .icon {
      color: #8b5cf6;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #0f172a;
      font-weight: 700;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .duration-info {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .duration {
      font-size: 1.25rem;
      font-weight: 700;
      color: #3d2645;
      font-family: 'Courier New', monospace;
      letter-spacing: 1px;
    }

    .playback-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .button-group {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }

    .play-btn, .pause-btn, .stop-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: white;
    }

    .play-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }

    .play-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .pause-btn {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
    }

    .pause-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
    }

    .stop-btn {
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
    }

    .stop-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .playback-progress {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .current-time, .total-time {
      font-size: 0.85rem;
      font-weight: 600;
      color: #6b7280;
      font-family: 'Courier New', monospace;
      min-width: 50px;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
      cursor: pointer;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%);
      transition: width 0.1s linear;
    }

    .dialog-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
    }

    @media (max-width: 480px) {
      .audio-preview-dialog {
        padding: 1.5rem;
      }

      .dialog-header h2 {
        font-size: 1.25rem;
      }

      .button-group {
        flex-direction: column;
      }

      .play-btn, .pause-btn, .stop-btn {
        width: 100%;
      }
    }
  `]
})
export class AudioPreviewDialogComponent implements OnInit, OnDestroy {
  isPlaying: boolean = false;
  currentPlayTime: number = 0;
  audioPlayer: HTMLAudioElement | null = null;
  private playbackInterval: any;

  constructor(
    public dialogRef: MatDialogRef<AudioPreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AudioPreviewDialogData
  ) {}

  ngOnInit(): void {
    // Create audio player from blob
    const audioUrl = URL.createObjectURL(this.data.audioBlob);
    this.audioPlayer = new Audio(audioUrl);
  }

  ngOnDestroy(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer = null;
    }
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
    }
  }

  playAudio(): void {
    if (this.audioPlayer) {
      this.audioPlayer.play();
      this.isPlaying = true;
      this.startPlaybackTracking();
    }
  }

  pauseAudio(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.isPlaying = false;
      this.stopPlaybackTracking();
    }
  }

  stopAudio(): void {
    if (this.audioPlayer) {
      this.audioPlayer.pause();
      this.audioPlayer.currentTime = 0;
      this.isPlaying = false;
      this.currentPlayTime = 0;
      this.stopPlaybackTracking();
    }
  }

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

  private stopPlaybackTracking(): void {
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
      this.playbackInterval = null;
    }
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

