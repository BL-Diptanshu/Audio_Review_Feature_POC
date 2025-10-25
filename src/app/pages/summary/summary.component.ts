import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MeetingService } from '../../core/services/meeting.service';
import { MeetingSession } from '../../models/meeting.model';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SummaryComponent implements OnInit, OnDestroy {
  meeting: MeetingSession | undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private meetingService: MeetingService
  ) {}

  ngOnInit(): void {
    // Get meeting ID from route params and fetch meeting data
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const meetingId = params['meetingId'];
      this.meeting = this.meetingService.getMeetingById(meetingId);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Format duration from seconds to readable format
   * @param seconds - Duration in seconds
   * @returns Formatted duration string (e.g., "5m 30s")
   */
  formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  /**
   * Copy meeting summary to clipboard
   */
  copySummary(): void {
    if (this.meeting) {
      navigator.clipboard.writeText(this.meeting.summary);
      alert('Summary copied to clipboard!');
    }
  }

  /**
   * Copy meeting transcript to clipboard
   */
  copyTranscript(): void {
    if (this.meeting) {
      navigator.clipboard.writeText(this.meeting.transcript);
      alert('Transcript copied to clipboard!');
    }
  }

  /**
   * Download meeting data as plain text file
   */
  downloadAsText(): void {
    if (!this.meeting) return;

    const content = `MEETING SUMMARY
================

Mentor: ${this.meeting.mentorName}
Date: ${new Date(this.meeting.startTime).toLocaleString()}
Duration: ${this.formatDuration(this.meeting.duration)}

SUMMARY
-------
${this.meeting.summary}

TRANSCRIPT
----------
${this.meeting.transcript}`;

    const blob = new Blob([content], { type: 'text/plain' });
    this.downloadFile(blob, `meeting-${this.meeting.id}.txt`);
  }

  /**
   * Download meeting data as PDF file
   * Note: This creates a simple text-based PDF. For production,
   * consider using a library like pdfkit or jsPDF
   */
  downloadAsPDF(): void {
    if (!this.meeting) return;

    // TODO: For production, use a proper PDF library like jsPDF or pdfkit
    const content = `MEETING SUMMARY\n\nMentor: ${this.meeting.mentorName}\nDate: ${new Date(this.meeting.startTime).toLocaleString()}\nDuration: ${this.formatDuration(this.meeting.duration)}\n\nSUMMARY\n${this.meeting.summary}\n\nTRANSCRIPT\n${this.meeting.transcript}`;

    const blob = new Blob([content], { type: 'application/pdf' });
    this.downloadFile(blob, `meeting-${this.meeting.id}.pdf`);
  }

  /**
   * Helper method to trigger file download
   * @param blob - File content as Blob
   * @param filename - Name of the file to download
   */
  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

