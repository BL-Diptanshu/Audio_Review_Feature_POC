import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { MeetingComponent } from './pages/meeting/meeting.component';
import { SummaryComponent } from './pages/summary/summary.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'meeting/:mentorId',
    component: MeetingComponent
  },
  {
    path: 'summary/:meetingId',
    component: SummaryComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
