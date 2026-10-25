import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../constants';
import {
  EventPayload,
  ManagedUser,
  RazorpayOrder,
  RazorpayOrderRequest,
  RazorpayPaymentVerification,
  VenueEvent,
  VenueTicket,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly eventsUrl = `${API_BASE}/events`;
  private readonly ticketsUrl = `${API_BASE}/tickets`;

  getEvents(): Observable<VenueEvent[]> {
    return this.http.get<VenueEvent[]>(this.eventsUrl);
  }

  createEvent(payload: EventPayload): Observable<VenueEvent> {
    return this.http.post<VenueEvent>(this.eventsUrl, payload);
  }

  getUsers(): Observable<ManagedUser[]> {
    return this.http.get<ManagedUser[]>(`${API_BASE}/users`);
  }

  updateUserRole(id: number, role: ManagedUser['role']): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(`${API_BASE}/users/${id}/role`, { role });
  }

  getTickets(): Observable<VenueTicket[]> {
    return this.http.get<VenueTicket[]>(this.ticketsUrl);
  }

  createRazorpayOrder(payload: RazorpayOrderRequest): Observable<RazorpayOrder> {
    return this.http.post<RazorpayOrder>(`${API_BASE}/payments/create-order`, payload);
  }

  verifyRazorpayPayment(payload: RazorpayPaymentVerification): Observable<VenueTicket> {
    return this.http.post<VenueTicket>(`${API_BASE}/payments/verify`, payload);
  }
}
