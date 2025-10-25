import { TestBed } from '@angular/core/testing';
import { MeetingService } from './meeting.service';

describe('MeetingService', () => {
  let service: MeetingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MeetingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a new meeting', () => {
    const meeting = service.createMeeting('mentor-1', 'Dr. John Doe');
    expect(meeting).toBeTruthy();
    expect(meeting.mentorId).toBe('mentor-1');
    expect(meeting.mentorName).toBe('Dr. John Doe');
    expect(meeting.status).toBe('recording');
  });

  it('should process meeting audio and return transcript and summary', (done) => {
    const meeting = service.createMeeting('mentor-1', 'Dr. John Doe');
    const audioBlob = new Blob(['test audio'], { type: 'audio/wav' });

    service.processMeetingAudio(audioBlob, meeting).subscribe(result => {
      expect(result.transcript).toBeTruthy();
      expect(result.summary).toBeTruthy();
      done();
    });
  });

  it('should save meeting to storage', (done) => {
    const meeting = service.createMeeting('mentor-1', 'Dr. John Doe');
    service.saveMeeting(meeting, 'Test transcript', 'Test summary');

    service.getMeetings().subscribe(meetings => {
      expect(meetings.length).toBeGreaterThan(0);
      const savedMeeting = meetings.find(m => m.id === meeting.id);
      expect(savedMeeting).toBeTruthy();
      expect(savedMeeting?.transcript).toBe('Test transcript');
      expect(savedMeeting?.summary).toBe('Test summary');
      done();
    });
  });
});

