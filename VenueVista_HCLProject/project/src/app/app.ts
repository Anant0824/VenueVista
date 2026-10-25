import { Component, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { Navbar } from './components/navbar';
import { Ticker } from './components/ticker';
import { CheckoutModal } from './components/checkout-modal';
import { VenueStore } from './services/venue.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Ticker, CheckoutModal],
  templateUrl: './app.html',
})
export class App {
  private readonly store = inject(VenueStore);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly showLogin = computed(() => this.url().split('?')[0] === '/login');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.store.loadEvents();
    }
  }
}
