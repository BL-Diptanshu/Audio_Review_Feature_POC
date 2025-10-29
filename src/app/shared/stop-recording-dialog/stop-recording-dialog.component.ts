import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface StopRecordingDialogData {
  recordingDuration: number;
}

@Component({
  selector: 'app-stop-recording-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="stop-recording-dialog">
      <div class="dialog-header">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <h2>Recording Paused</h2>
      </div>

      <div class="dialog-content">
        <p class="message">Your recording process has temporarily stopped.</p>
        <div class="duration-info">
          <span class="label">Recording Duration:</span>
          <span class="duration">{{ formatTime(data.recordingDuration) }}</span>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn btn-primary" (click)="onResume()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Resume Recording
        </button>
        <button class="btn btn-secondary" (click)="onPreview()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Preview
        </button>
      </div>
    </div>
  `,
  styles: [`
    .stop-recording-dialog {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      max-width: 500px;
      text-align: center;
    }

    .dialog-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .icon {
      color: #f59e0b;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
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
      gap: 1rem;
    }

    .message {
      margin: 0;
      font-size: 1rem;
      color: #475569;
      font-weight: 500;
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

    .dialog-actions {
      display: flex;
      gap: 1rem;
      flex-direction: column;
    }

    .btn {
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
    }

    .btn-secondary:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
    }

    @media (max-width: 480px) {
      .stop-recording-dialog {
        padding: 1.5rem;
      }

      .dialog-header h2 {
        font-size: 1.25rem;
      }

      .btn {
        padding: 0.875rem 1rem;
        font-size: 0.85rem;
      }
    }
  `]
})
export class StopRecordingDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<StopRecordingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StopRecordingDialogData
  ) {}

  onResume(): void {
    this.dialogRef.close('resume');
  }

  onPreview(): void {
    this.dialogRef.close('preview');
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

