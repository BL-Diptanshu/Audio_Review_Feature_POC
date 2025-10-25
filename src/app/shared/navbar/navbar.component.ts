import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-brand">
          <span class="app-icon">🎤</span>
          <span class="app-title">MentorMeet</span>
        </div>
        <div class="navbar-nav">
          <a
            routerLink="/"
            class="nav-link"
            [class.disabled]="isHomePage"
            [attr.aria-disabled]="isHomePage"
          >
            Home
          </a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: linear-gradient(90deg, #5B6FD8 0%, #9B7FD8 50%, #B77FD8 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: bold;
      cursor: pointer;
    }

    .app-icon {
      font-size: 2rem;
    }

    .app-title {
      letter-spacing: 0.5px;
    }

    .navbar-nav {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.3s ease;
    }

    .nav-link:hover {
      opacity: 0.8;
    }

    .nav-link.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    @media (max-width: 600px) {
      .navbar-container {
        flex-direction: column;
        gap: 1rem;
      }

      .app-title {
        font-size: 1.2rem;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {
  isHomePage: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check if current route is home page
    this.isHomePage = this.router.url === '/';

    // Subscribe to route changes
    this.router.events.subscribe(() => {
      this.isHomePage = this.router.url === '/';
    });
  }
}

