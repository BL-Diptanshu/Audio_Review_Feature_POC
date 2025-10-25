export interface Mentor {
  id: string;
  name: string;
  email?: string;
  department: string;
  studentCount: number;
  profileImage?: string;
  batchId: string;
}

export interface MentorListItem extends Mentor {
  lastMeetingDate?: Date;
  totalMeetings: number;
}

