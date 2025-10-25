import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Mentor, MentorListItem } from '../../models/mentor.model';

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private mentors$ = new BehaviorSubject<MentorListItem[]>([]);

  constructor() {
    this.initializeMentors();
  }

  private initializeMentors(): void {
    const mentorNames = [
      'Vishal Bhakare',
      'Sahil Gawathe',
      'Chirag Patil',
      'Bhuvan Prakash P',
      'Balaji Sapkal',
      'Surriyaa P P',
      'Thanigaivel R',
      'Pavan Medam',
      'Nivrutti Wagh',
      'Sriram J',
      'Yogeesh DR',
      'Lynda Princy Rita M',
      'Lakshmi',
      'Sravanthi Kallavai',
      'Vinay G',
      'Hemasri',
      'Thamarai Kannan G',
      'Koteswara Reddy M',
      'Pooja S S',
      'Kalki D',
      'Karthik Reddy Indukuri',
      'Bhumesh Ranjane',
      'Vanmathi',
      'Sharmila',
      'Chandana',
      'Purushotham',
      'Niranjan',
      'Deepika Ramireddy',
      'Vimal Raj',
      'Stalin Gunasekaran',
      'Kuralarasan'
    ];

    const mockMentors: MentorListItem[] = mentorNames.map((name, index) => ({
      id: `mentor-${index + 1}`,
      name: name,
      email: undefined,
      department: this.getRandomDepartment(),
      studentCount: 60,
      profileImage: undefined,
      batchId: `BATCH-${String(Math.floor(index / 10) + 1).padStart(2, '0')}`,
      totalMeetings: Math.floor(Math.random() * 20),
      lastMeetingDate: this.getRandomDate()
    }));

    this.mentors$.next(mockMentors);
  }

  getMentors(): Observable<MentorListItem[]> {
    return this.mentors$.asObservable();
  }

  getMentorById(id: string): MentorListItem | undefined {
    return this.mentors$.value.find(m => m.id === id);
  }

  private getRandomDepartment(): string {
    const departments = ['Computer Science', 'Engineering', 'Business', 'Medicine', 'Law', 'Arts', 'Science', 'Education'];
    return departments[Math.floor(Math.random() * departments.length)];
  }

  private getRandomDate(): Date {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 90);
    return new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }
}

