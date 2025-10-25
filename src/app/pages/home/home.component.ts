import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MentorService } from '../../core/services/mentor.service';
import { MeetingService } from '../../core/services/meeting.service';
import { MentorListItem } from '../../models/mentor.model';
import { MeetingSession } from '../../models/meeting.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  mentors$!: Observable<MentorListItem[]>;
  meetings$!: Observable<MeetingSession[]>;
  studentForm!: FormGroup;

  constructor(
    private mentorService: MentorService,
    private meetingService: MeetingService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.mentors$ = this.mentorService.getMentors();
    this.meetings$ = this.meetingService.getMeetings();
  }

  /**
   * Initialize the student form with validation rules
   */
  private initializeForm(): void {
    this.studentForm = this.formBuilder.group({
      studentName: ['', [Validators.minLength(2)]],  // Made optional
      registrationNumber: ['', [Validators.required, Validators.minLength(3)]],
      batchId: ['', Validators.required],
      emailId: ['', [Validators.email]],
      mentorId: ['', Validators.required]
    });
  }

  /**
   * Check if a form field is invalid and touched
   * @param fieldName - Name of the form field
   * @returns true if field is invalid and touched
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.studentForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Handle form submission
   * Stores student data and navigates to meeting page
   */
  onSubmit(): void {
    if (!this.studentForm.valid) {
      return;
    }

    const formData = this.studentForm.value;

    // Store student session data in the meeting service
    this.meetingService.setStudentSession({
      studentName: formData.studentName,
      registrationNumber: formData.registrationNumber,
      batchId: formData.batchId,
      emailId: formData.emailId,
      mentorId: formData.mentorId
    });

    // Navigate to meeting page with mentor ID
    this.router.navigate(['/meeting', formData.mentorId]);
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
}

