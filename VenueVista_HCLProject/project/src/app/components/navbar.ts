import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from './icon';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './navbar.html',
})
export class Navbar {
  private readonly authService = inject(AuthService);

  isLoggedIn(): boolean {
    return !!this.authService.currentToken();
  }

  isAdmin(): boolean {
    return this.authService.currentUserRole() === 'ROLE_ADMIN';
  }

  get navItems() {
    const items = [
      { label: 'Home', path: '/' },
      { label: 'My Stash', path: '/stash' },
    ];

    if (this.isAdmin()) {
      items.push({ label: 'Control Room', path: '/control-room' });
    }

    return items;
  }

  logout(): void {
    this.authService.logout();
  }
}
