import { Component, inject } from '@angular/core';
import { VenueStore } from '../services/venue.store';
import { EventCard } from '../components/event-card';
import { Icon } from '../components/icon';
import { VenueEvent } from '../models';

@Component({
  selector: 'app-home-view',
  imports: [EventCard, Icon],
  templateUrl: './home-view.html',
})
export class HomeView {
  private readonly store = inject(VenueStore);
  readonly events = this.store.events;

  onBuy(event: VenueEvent): void {
    this.store.openCheckout(event);
  }
}
