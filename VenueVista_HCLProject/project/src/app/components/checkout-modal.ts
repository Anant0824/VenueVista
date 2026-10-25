import { Component, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { VenueStore } from '../services/venue.store';
import { ApiService } from '../services/api.service';
import { VIP_MULTIPLIER } from '../constants';
import { Icon } from './icon';
import { environment } from '../../environments/environment';

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  theme: { color: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayCheckoutInstance {
  open(): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

let razorpayScript: Promise<void> | undefined;

function loadRazorpayScript(): Promise<void> {
  if (window.Razorpay) {
    return Promise.resolve();
  }
  if (!razorpayScript) {
    razorpayScript = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        razorpayScript = undefined;
        reject(new Error('Unable to load Razorpay Checkout.'));
      };
      document.head.appendChild(script);
    });
  }
  return razorpayScript;
}

@Component({
  selector: 'app-checkout-modal',
  imports: [Icon],
  templateUrl: './checkout-modal.html',
})
export class CheckoutModal {
  private readonly store = inject(VenueStore);
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly event = this.store.checkoutEvent;
  readonly isOpen = this.store.modalOpen;

  ticketType = signal<'GA' | 'VIP'>('GA');
  quantity = signal(1);
  processing = signal(false);
  paymentError = signal<string | null>(null);

  private lastEventKey = '';

  constructor() {
    effect(() => {
      const open = this.isOpen();
      const eventKey = this.event()?.id ?? '';
      if (open && eventKey !== this.lastEventKey) {
        this.lastEventKey = eventKey;
        this.ticketType.set('GA');
        this.quantity.set(1);
        this.processing.set(false);
        this.paymentError.set(null);
      }
      if (!open) {
        this.lastEventKey = '';
      }
    });
  }

  unitPrice(): number {
    const event = this.event();
    if (!event) return 0;
    const basePrice = this.roundCurrency(event.basePrice);
    return this.ticketType() === 'VIP' ? this.roundCurrency(basePrice * VIP_MULTIPLIER) : basePrice;
  }

  total(): number {
    return this.roundCurrency(this.unitPrice() * this.quantity());
  }

  vipPrice(): number {
    const event = this.event();
    return event
      ? this.roundCurrency(this.roundCurrency(event.basePrice) * VIP_MULTIPLIER)
      : 0;
  }

  private roundCurrency(amount: number): number {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
  }

  close(): void {
    this.store.closeCheckout();
  }

  stop(ev: Event): void {
    ev.stopPropagation();
  }

  decQty(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  incQty(): void {
    this.quantity.update((q) => Math.min(10, q + 1));
  }

  confirm(): void {
    const event = this.event();
    const total = this.total();
    if (!event || this.processing()) return;
    if (!Number.isFinite(total) || total <= 0 || !Number.isInteger(this.quantity())) {
      this.paymentError.set('Unable to calculate the order amount.');
      return;
    }
    if (!environment.razorpayKeyId.startsWith('rzp_test_')) {
      this.paymentError.set('Razorpay Test Mode key is not configured.');
      return;
    }

    this.processing.set(true);
    this.paymentError.set(null);

    this.api.createRazorpayOrder({
      eventId: Number(event.id),
      quantity: this.quantity(),
      ticketType: this.ticketType(),
    }).subscribe({
      next: (order) => {
        loadRazorpayScript().then(() => {
          if (!window.Razorpay) {
            throw new Error('Razorpay Checkout did not initialize.');
          }
          let verificationStarted = false;
          const checkout = new window.Razorpay({
            key: environment.razorpayKeyId,
            amount: order.amount,
            currency: order.currency,
            name: 'VenueVista',
            description: `${event.title} - ${this.ticketType()} ticket`,
            order_id: order.orderId,
            theme: { color: '#00f0ff' },
            handler: (payment) => {
              verificationStarted = true;
              this.verifyPayment(payment, String(event.id));
            },
            modal: {
              ondismiss: () => {
                if (!verificationStarted) {
                  this.processing.set(false);
                }
              },
            },
          });
          checkout.open();
        }).catch((error: unknown) => {
          console.error('Failed to initialize Razorpay Checkout.', error);
          this.processing.set(false);
          this.paymentError.set('Unable to open Razorpay Checkout. Please try again.');
        });
      },
      error: (err) => {
        console.error('Unable to create Razorpay order.', err);
        this.processing.set(false);
        this.paymentError.set('Unable to start checkout. Please check ticket availability and try again.');
      },
    });
  }

  private verifyPayment(payment: RazorpaySuccessResponse, eventId: string): void {
    this.api.verifyRazorpayPayment({
      razorpay_order_id: payment.razorpay_order_id,
      razorpay_payment_id: payment.razorpay_payment_id,
      razorpay_signature: payment.razorpay_signature,
    }).subscribe({
      next: (ticket) => {
        this.processing.set(false);
        this.store.addTicket({
          id: String(ticket.id),
          eventId: String(ticket.eventId),
          eventTitle: ticket.eventTitle,
          eventDate: ticket.eventDate,
          eventVenue: ticket.eventVenue,
          ticketType: ticket.ticketType,
          quantity: ticket.quantity,
          unitPrice: ticket.unitPrice,
          totalPrice: ticket.totalPrice,
        });
        this.store.incrementEventSoldCount(eventId, ticket.quantity);
        this.close();
        void this.router.navigateByUrl('/stash');
      },
      error: (err) => {
        console.error('Razorpay payment verification failed.', err);
        this.processing.set(false);
        this.paymentError.set('Payment verification failed. Please contact support before trying again.');
      },
    });
  }
}
