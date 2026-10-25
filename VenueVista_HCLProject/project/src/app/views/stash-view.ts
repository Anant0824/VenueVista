import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { VenueStore } from '../services/venue.store';
import { ACCENTS } from '../constants';
import { Icon } from '../components/icon';
import { Accent, VenueTicket } from '../models';

@Component({
  selector: 'app-stash-view',
  imports: [Icon],
  templateUrl: './stash-view.html',
})
export class StashView implements OnInit {
  private readonly store = inject(VenueStore);
  private readonly platformId = inject(PLATFORM_ID);
  readonly tickets = this.store.tickets;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.store.load();
    }
  }

  accent(i: number): Accent {
    return ACCENTS[i % ACCENTS.length];
  }

  shortId(ticket: VenueTicket): string {
    return ticket.id.slice(-8).toUpperCase();
  }
}
