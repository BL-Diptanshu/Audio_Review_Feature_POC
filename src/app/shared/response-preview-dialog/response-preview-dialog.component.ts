import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ResponsePreviewData {
  mentorName: string;
  meetingDuration: string;
  transcript: string;
}

@Component({
  selector: 'app-response-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="response-preview-dialog">
      <div class="dialog-header">
        <h2>Meeting Summary</h2>
        <button mat-icon-button (click)="onClose()" class="close-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="dialog-content">
        <!-- Mentor Name -->
        <div class="summary-item">
          <label class="summary-label">Mentor Name</label>
          <p class="summary-value">{{ data.mentorName }}</p>
        </div>

        <!-- Meeting Duration -->
        <div class="summary-item">
          <label class="summary-label">Meeting Duration</label>
          <p class="summary-value">{{ data.meetingDuration }}</p>
        </div>

        <!-- Transcript -->
        <div class="summary-item">
          <label class="summary-label">Session Transcript</label>
          <p class="summary-value transcript">{{ data.transcript }}</p>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="btn btn-secondary" (click)="onClose()">
          Close
        </button>
      </div>
    </div>
  `,
  styles: [`
    .response-preview-dialog {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      max-width: 600px;
      max-height: 80vh;
      overflow-y: auto;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 1rem;
      margin-bottom: 1rem;
    }

    .dialog-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #0f172a;
      font-weight: 700;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      transition: all 0.3s ease;
    }

    .close-btn:hover {
      color: #0f172a;
      transform: rotate(90deg);
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      flex: 1;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .summary-label {
      font-size: 0.9rem;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .summary-value {
      margin: 0;
      font-size: 1rem;
      color: #0f172a;
      font-weight: 500;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #5B6FD8;
    }

    .summary-value.transcript {
      line-height: 1.6;
      max-height: 200px;
      overflow-y: auto;
    }

    .dialog-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      border-top: 1px solid #e2e8f0;
      padding-top: 1rem;
      margin-top: 1rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-secondary {
      background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
    }

    .btn-secondary:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(107, 114, 128, 0.4);
    }

    @media (max-width: 480px) {
      .response-preview-dialog {
        padding: 1.5rem;
        max-width: 100%;
      }

      .dialog-header h2 {
        font-size: 1.25rem;
      }

      .summary-value {
        font-size: 0.9rem;
      }
    }
  `]
})
export class ResponsePreviewDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ResponsePreviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ResponsePreviewData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}

