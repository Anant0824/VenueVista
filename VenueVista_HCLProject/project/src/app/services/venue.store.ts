import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { VenueEvent, VenueTicket } from '../models';

function mapEvent(e: VenueEvent): VenueEvent {
  return {
    id: String(e.id),
    title: e.title,
    artist: e.artist,
    genre: e.genre,
    date: e.date,
    time: e.time,
    venue: e.venue,
    city: e.city,
    basePrice: e.basePrice,
    capacity: e.capacity,
    soldCount: e.soldCount,
    image: e.image,
  };
}

function mapTicket(t: VenueTicket): VenueTicket {
  return {
    id: String(t.id),
    eventId: String(t.eventId),
    eventTitle: t.eventTitle,
    eventDate: t.eventDate,
    eventVenue: t.eventVenue,
    ticketType: t.ticketType,
    quantity: t.quantity,
    unitPrice: t.unitPrice,
    totalPrice: t.totalPrice,
  };
}

@Injectable({ providedIn: 'root' })
export class VenueStore {
  private readonly api = inject(ApiService);

  readonly events = signal<VenueEvent[]>([]);
  readonly tickets = signal<VenueTicket[]>([]);
  readonly checkoutEvent = signal<VenueEvent | null>(null);
  readonly modalOpen = signal(false);
  private loadGeneration = 0;

  load(): void {
    const generation = ++this.loadGeneration;
    this.fetchEvents(generation);
    this.fetchTickets(generation);
  }

  loadEvents(): void {
    const generation = ++this.loadGeneration;
    this.fetchEvents(generation);
  }

  private fetchEvents(generation: number): void {
    this.api.getEvents().subscribe({
      next: (data) => {
        if (generation === this.loadGeneration && Array.isArray(data)) {
          this.events.set(data.map(mapEvent));
        }
      },
      error: (err) => console.error('Failed to fetch events:', err),
    });
  }

  private fetchTickets(generation: number): void {
    this.api.getTickets().subscribe({
      next: (data) => {
        if (generation === this.loadGeneration && Array.isArray(data)) {
          this.tickets.set(data.map(mapTicket));
        }
      },
      error: (err) => console.error('Failed to fetch tickets:', err),
    });
  }

  openCheckout(event: VenueEvent): void {
    this.checkoutEvent.set(event);
    this.modalOpen.set(true);
  }

  closeCheckout(): void {
    this.modalOpen.set(false);
  }

  reset(): void {
    const generation = ++this.loadGeneration;
    this.events.set([]);
    this.tickets.set([]);
    this.checkoutEvent.set(null);
    this.modalOpen.set(false);

    this.fetchEvents(generation);
  }

  addTicket(ticket: VenueTicket): void {
    this.tickets.update((prev) => [mapTicket(ticket), ...prev]);
  }

  addEvent(event: VenueEvent): void {
    this.events.update((prev) => [...prev, mapEvent(event)]);
  }

  incrementEventSoldCount(eventId: string, quantity: number): void {
    this.events.update((events) =>
      events.map((event) =>
        event.id === eventId
          ? { ...event, soldCount: event.soldCount + quantity }
          : event,
      ),
    );
  }
}
