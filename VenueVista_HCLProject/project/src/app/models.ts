export interface VenueEvent {
  id: string;
  title: string;
  artist: string;
  genre: string;
  date: string | Date;
  time: string;
  venue: string;
  city: string;
  basePrice: number;
  capacity: number;
  soldCount: number;
  image: string;
}

export interface VenueTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  ticketType: 'GA' | 'VIP';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface EventPayload {
  title: string;
  artist: string;
  genre: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  basePrice: number;
  capacity: number;
  soldCount: number;
  image: string;
}

export interface RazorpayOrderRequest {
  eventId: number;
  quantity: number;
  ticketType: 'GA' | 'VIP';
}

export interface FreeTicketRegistrationRequest {
  eventId: number;
  quantity: number;
  ticketType: 'GA' | 'VIP';
}

export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: 'INR';
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface ManagedUser {
  id: number;
  username: string;
  email: string | null;
  role: 'ROLE_USER' | 'ROLE_CREATOR' | 'ROLE_ADMIN';
  roles: string[];
}

export interface Accent {
  border: string;
  glow: string;
  text: string;
  bg: string;
  gradient: string;
  hover: string;
}

export type ViewName = 'home' | 'stash' | 'control-room';
