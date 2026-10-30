import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VenueStore } from '../services/venue.store';
import { ApiService } from '../services/api.service';
import { ManagedUser } from '../models';
import { Icon } from '../components/icon';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-control-room-view',
  imports: [FormsModule, Icon],
  templateUrl: './control-room-view.html',
})
export class ControlRoomView {
  private readonly store = inject(VenueStore);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly events = this.store.events;
  readonly tickets = this.store.tickets;
  readonly users = signal<ManagedUser[]>([]);
  readonly activeTab = signal<'events' | 'users'>('events');
  readonly loadingUsers = signal(false);
  readonly updatingUserId = signal<number | null>(null);
  readonly userError = signal<string | null>(null);

  form = {
    title: '',
    date: '',
    venue: '',
    artist: '',
    city: '',
    image: '',
    genre: '',
    time: '',
    capacity: '',
    basePrice: '',
  };

  publishing = signal(false);
  flash = signal(false);

  readonly minDate = new Date().toISOString().split('T')[0];
  readonly inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-acid/50 transition-colors';

  readonly totalRevenue = computed(
    () => 0 + this.tickets().reduce((s, t) => s + t.totalPrice, 0),
  );
  readonly ticketsSold = computed(
    () => 0 + this.tickets().reduce((s, t) => s + t.quantity, 0),
  );
  readonly activeEvents = computed(() => this.events().length);

  canManageUser(user: ManagedUser): boolean {
    return !user.superAdmin && user.username !== this.auth.currentUsername();
  }

  selectTab(tab: 'events' | 'users'): void {
    this.activeTab.set(tab);
    if (tab === 'users') {
      this.loadUsers();
    }
  }

  private loadUsers(): void {
    this.loadingUsers.set(true);
    this.userError.set(null);
    this.api.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loadingUsers.set(false);
      },
      error: (err) => {
        console.error('Failed to load users.', err);
        this.userError.set('Unable to load users. Please try again.');
        this.loadingUsers.set(false);
      },
    });
  }

  toggleUserRole(user: ManagedUser): void {
    if (this.updatingUserId() !== null) {
      return;
    }

    const role = user.role === 'ROLE_USER' ? 'ROLE_CREATOR' : 'ROLE_USER';
    this.updatingUserId.set(user.id);
    this.userError.set(null);
    this.api.updateUserRole(user.id, role).subscribe({
      next: (updatedUser) => {
        this.users.update((users) =>
          users.map((currentUser) => currentUser.id === updatedUser.id ? updatedUser : currentUser),
        );
        this.updatingUserId.set(null);
      },
      error: (err) => {
        console.error(`Failed to update the role for user ${user.id}.`, err);
        this.userError.set(`Unable to update ${user.username}'s role. Please try again.`);
        this.updatingUserId.set(null);
      },
    });
  }

  toggleAdminRole(user: ManagedUser): void {
    if (this.updatingUserId() !== null || !this.canManageUser(user)) {
      return;
    }

    const role = user.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    this.updatingUserId.set(user.id);
    this.userError.set(null);
    this.api.updateUserRole(user.id, role).subscribe({
      next: (updatedUser) => {
        this.users.update((users) =>
          users.map((currentUser) => currentUser.id === updatedUser.id ? updatedUser : currentUser),
        );
        this.updatingUserId.set(null);
      },
      error: (err) => {
        console.error(`Failed to update the admin role for user ${user.id}.`, err);
        this.userError.set(`Unable to update ${user.username}'s admin role. Please try again.`);
        this.updatingUserId.set(null);
      },
    });
  }

  priceInvalid(): boolean {
    const price = Number(this.form.basePrice);
    return this.form.basePrice !== '' && (!Number.isFinite(price) || price < 0);
  }

  capacityInvalid(): boolean {
    const capacity = Number(this.form.capacity);
    return this.form.capacity !== '' && (!Number.isInteger(capacity) || capacity < 1);
  }

  canPublish(): boolean {
    return (
      !this.publishing() &&
      !!this.form.title.trim() &&
      !!this.form.date &&
      !!this.form.venue.trim() &&
      !!this.form.artist.trim() &&
      !!this.form.city.trim() &&
      !!this.form.genre.trim() &&
      !!this.form.time &&
      this.form.capacity !== '' &&
      this.form.basePrice !== '' &&
      this.isValidImageUrl() &&
      !this.priceInvalid() &&
      !this.capacityInvalid()
    );
  }

  private isValidImageUrl(): boolean {
    try {
      const url = new URL(this.form.image.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  blockInvalidKeys(e: KeyboardEvent): void {
    if (['-', '+', 'e', 'E'].includes(e.key)) e.preventDefault();
  }

  publish(): void {
    if (!this.canPublish()) {
      return;
    }
    this.publishing.set(true);

    const payload = {
      title: this.form.title.trim(),
      artist: this.form.artist.trim(),
      genre: this.form.genre.trim(),
      date: this.form.date,
      time: this.form.time,
      venue: this.form.venue.trim(),
      city: this.form.city.trim(),
      basePrice: Number(this.form.basePrice),
      capacity: Number(this.form.capacity),
      soldCount: 0,
      image: this.form.image.trim(),
    };

    this.api.createEvent(payload).subscribe({
      next: (savedEvent) => {
        this.store.addEvent({
          id: String(savedEvent.id),
          title: savedEvent.title,
          artist: savedEvent.artist,
          genre: savedEvent.genre,
          date: savedEvent.date,
          time: savedEvent.time,
          venue: savedEvent.venue,
          city: savedEvent.city,
          basePrice: savedEvent.basePrice,
          capacity: savedEvent.capacity,
          soldCount: savedEvent.soldCount,
          image: savedEvent.image,
        });
        this.form = {
          title: '',
          date: '',
          venue: '',
          artist: '',
          city: '',
          image: '',
          genre: '',
          time: '',
          capacity: '',
          basePrice: '',
        };
        this.publishing.set(false);
        this.flash.set(true);
        setTimeout(() => this.flash.set(false), 2500);
      },
      error: (err) => {
        console.error(err);
        this.publishing.set(false);
      },
    });
  }
}
