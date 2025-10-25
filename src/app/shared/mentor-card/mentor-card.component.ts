import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MentorListItem } from '../../models/mentor.model';

@Component({
  selector: 'app-mentor-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="mentor-card">
      <div class="mentor-header">
        <div class="mentor-avatar">{{ mentor.name.charAt(0) }}</div>
        <div class="mentor-info">
          <h3 class="mentor-name">{{ mentor.name }}</h3>
          <p class="mentor-department">{{ mentor.department }}</p>
        </div>
      </div>
      <div class="mentor-details">
        <div class="detail-item">
          <span class="detail-label">Students:</span>
          <span class="detail-value">{{ mentor.studentCount }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Meetings:</span>
          <span class="detail-value">{{ mentor.totalMeetings }}</span>
        </div>
      </div>
      <button 
        class="start-meeting-btn"
        [routerLink]="['/meeting', mentor.id]"
      >
        Start Meeting
      </button>
    </div>
  `,
  styles: [`
    .mentor-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      cursor: pointer;
    }

    .mentor-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }

    .mentor-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .mentor-avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      flex-shrink: 0;
    }

    .mentor-info {
      flex: 1;
    }

    .mentor-name {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
    }

    .mentor-department {
      margin: 0.25rem 0 0 0;
      font-size: 0.9rem;
      color: #666;
    }

    .mentor-details {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }

    .detail-item {
      flex: 1;
      text-align: center;
    }

    .detail-label {
      display: block;
      font-size: 0.85rem;
      color: #999;
      margin-bottom: 0.25rem;
    }

    .detail-value {
      display: block;
      font-size: 1.3rem;
      font-weight: bold;
      color: #667eea;
    }

    .start-meeting-btn {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.3s ease;
    }

    .start-meeting-btn:hover {
      opacity: 0.9;
    }

    .start-meeting-btn:active {
      transform: scale(0.98);
    }
  `]
})
export class MentorCardComponent {
  @Input() mentor!: MentorListItem;
}

