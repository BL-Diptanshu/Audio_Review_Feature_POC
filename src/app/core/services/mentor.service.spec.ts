import { TestBed } from '@angular/core/testing';
import { MentorService } from './mentor.service';

describe('MentorService', () => {
  let service: MentorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MentorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return 40 mentors', (done) => {
    service.getMentors().subscribe(mentors => {
      expect(mentors.length).toBe(40);
      done();
    });
  });

  it('should return mentor by id', () => {
    const mentor = service.getMentorById('mentor-1');
    expect(mentor).toBeTruthy();
    expect(mentor?.id).toBe('mentor-1');
  });

  it('should return undefined for non-existent mentor', () => {
    const mentor = service.getMentorById('non-existent');
    expect(mentor).toBeUndefined();
  });

  it('should have valid mentor properties', (done) => {
    service.getMentors().subscribe(mentors => {
      const mentor = mentors[0];
      expect(mentor.name).toBeTruthy();
      expect(mentor.email).toBeTruthy();
      expect(mentor.department).toBeTruthy();
      expect(mentor.studentCount).toBe(60);
      done();
    });
  });
});

