import { Component, Input, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-waveform',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="waveform-container">
      <canvas #waveformCanvas class="waveform-canvas"></canvas>
    </div>
  `,
  styles: [`
    .waveform-container {
      width: 100%;
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      border-radius: 8px;
      overflow: hidden;
      margin: 1rem 0;
    }

    .waveform-canvas {
      width: 100%;
      height: 100%;
    }
  `]
})
export class WaveformComponent implements OnInit, OnDestroy {
  @Input() audioLevel: number = 0;
  @ViewChild('waveformCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private animationFrameId: number | null = null;
  private waveformData: number[] = [];
  private maxDataPoints = 100;

  ngOnInit(): void {
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      this.initializeCanvas();
      this.animate();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initializeCanvas(): void {
    // Check if canvasRef is defined before accessing nativeElement
    if (!this.canvasRef || !this.canvasRef.nativeElement) {
      console.warn('Canvas reference not available');
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  }

  private animate(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Add new data point
    this.waveformData.push(this.audioLevel);
    if (this.waveformData.length > this.maxDataPoints) {
      this.waveformData.shift();
    }

    // Clear canvas
    ctx.fillStyle = 'rgba(245, 247, 250, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw waveform
    ctx.strokeStyle = '#667eea';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const barWidth = canvas.width / this.maxDataPoints;
    const centerY = canvas.height / 2;

    this.waveformData.forEach((level, index) => {
      const x = index * barWidth;
      const height = (level / 100) * (canvas.height / 2);
      const y = centerY - height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw bars
    ctx.fillStyle = 'rgba(102, 126, 234, 0.3)';
    this.waveformData.forEach((level, index) => {
      const x = index * barWidth;
      const height = (level / 100) * (canvas.height / 2);
      ctx.fillRect(x, centerY - height, barWidth - 1, height * 2);
    });

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}

