import { Component, input, output } from '@angular/core';
import { VenueEvent } from '../models';
import { ACCENTS } from '../constants';
import { Icon } from './icon';

@Component({
  selector: 'app-event-card',
  imports: [Icon],
  templateUrl: './event-card.html',
})
export class EventCard {
  readonly event = input.required<VenueEvent>();
  readonly index = input(0);
  readonly buy = output<VenueEvent>();

  accent() {
    return ACCENTS[this.index() % ACCENTS.length];
  }

  soldPct(): number {
    const e = this.event();
    return e.capacity > 0 ? Math.round((e.soldCount / e.capacity) * 100) : 0;
  }

  isSoldOut(): boolean {
    return this.soldPct() >= 100;
  }

  dateLabel(): string {
    const date = this.event().date;
    return typeof date === 'string' ? date : new Date(date).toLocaleDateString();
  }

  onCardClick(): void {
    if (!this.isSoldOut()) {
      this.buy.emit(this.event());
    }
  }

  onBuyClick(ev: Event): void {
    ev.stopPropagation();
    if (!this.isSoldOut()) {
      this.buy.emit(this.event());
    }
  }
}
