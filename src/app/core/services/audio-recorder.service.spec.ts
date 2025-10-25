import { TestBed } from '@angular/core/testing';
import { AudioRecorderService } from './audio-recorder.service';

describe('AudioRecorderService', () => {
  let service: AudioRecorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioRecorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with recording state false', (done) => {
    service.getRecordingState().subscribe(state => {
      expect(state.isRecording).toBe(false);
      expect(state.duration).toBe(0);
      expect(state.audioLevel).toBe(0);
      done();
    });
  });

  it('should initialize with no audio data', (done) => {
    service.getAudioData().subscribe(data => {
      expect(data).toBeNull();
      done();
    });
  });

  it('should reset recording state', () => {
    service.resetRecording();
    service.getRecordingState().subscribe(state => {
      expect(state.isRecording).toBe(false);
      expect(state.duration).toBe(0);
    });
  });
});

