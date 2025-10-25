import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioLevel: number;
}

@Injectable({
  providedIn: 'root'
})
export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingState$ = new BehaviorSubject<RecordingState>({
    isRecording: false,
    duration: 0,
    audioLevel: 0
  });
  private audioDataSubject$ = new BehaviorSubject<Blob | null>(null);
  private startTime: number = 0;
  private timerInterval: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animationFrameId: number | null = null;

  constructor() {}

  getRecordingState(): Observable<RecordingState> {
    return this.recordingState$.asObservable();
  }

  getAudioData(): Observable<Blob | null> {
    return this.audioDataSubject$.asObservable();
  }

  async startRecording(): Promise<void> {
    try {
      // If already recording, just resume
      if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
        this.mediaRecorder.resume();
        this.recordingState$.next({
          isRecording: true,
          duration: this.recordingState$.value.duration,
          audioLevel: 0
        });
        this.startTimer();
        this.updateAudioLevel();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Setup audio context for visualization
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      source.connect(this.analyser);

      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      this.startTime = Date.now();

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioDataSubject$.next(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.recordingState$.next({
        isRecording: true,
        duration: 0,
        audioLevel: 0
      });

      this.startTimer();
      this.updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.recordingState$.next({
        isRecording: false,
        duration: this.recordingState$.value.duration,
        audioLevel: 0
      });
      this.stopTimer();
      this.stopAudioLevelUpdate();
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.recordingState$.next({
        isRecording: false,
        duration: this.recordingState$.value.duration,
        audioLevel: 0
      });
      this.stopTimer();
      this.stopAudioLevelUpdate();
    }
  }

  private startTimer(): void {
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      this.recordingState$.next({
        ...this.recordingState$.value,
        duration: elapsed
      });
    }, 100);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateAudioLevel(): void {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const updateLevel = () => {
      this.analyser!.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedLevel = Math.min(100, (average / 255) * 100);

      this.recordingState$.next({
        ...this.recordingState$.value,
        audioLevel: normalizedLevel
      });

      if (this.recordingState$.value.isRecording) {
        this.animationFrameId = requestAnimationFrame(updateLevel);
      }
    };
    updateLevel();
  }

  private stopAudioLevelUpdate(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  resetRecording(): void {
    this.audioChunks = [];
    this.audioDataSubject$.next(null);
    this.recordingState$.next({
      isRecording: false,
      duration: 0,
      audioLevel: 0
    });
  }
}

