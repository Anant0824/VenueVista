import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Calendar, MapPin, Ticket, X, Minus, Plus, CheckCircle2,
  TrendingUp, DollarSign, CalendarPlus, Sparkles, QrCode,
  Loader2, ArrowRight, LogOut, User,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface MockEvent {
  id: string;
  title: string;
  artist: string;
  genre: string;
  date: Date;
  time: string;
  venue: string;
  city: string;
  basePrice: number;
  capacity: number;
  soldCount: number;
  image: string;
}

interface MockTicket {
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

type ViewName = 'home' | 'stash' | 'control-room';

const TICKER_ITEMS = [
  '🎟️ @zane just copped 2x VIP for Neon Nights',
  '🔥 80% sold out — Cyber Rave 2077',
  '💸 @mia transferred a ticket to @flux',
  '⚡ New drop: BVLGARI NEON FEST — this Friday',
  '🚀 @drake_fan snagged last GA for Electric Dreams',
  '👾 @vapor_queen unlocked VIP upgrade for Bass Galaxy',
  '🎵 Sold Out: VOID FESTIVAL 2026',
  '💥 @nyx just bought Floor Pass for Psychic Bloom',
  '🌐 @echo_x listed 3 tickets on resale — act fast',
  '🛸 NEW VENUE: Sector 7 Arena — 12,000 capacity',
];

const ACCENTS = [
  { border: 'neo-border-acid', glow: 'glow-acid', text: 'text-acid', bg: 'bg-acid', gradient: 'from-acid/20', hover: 'hover:border-acid' },
  { border: 'neo-border-purple', glow: 'glow-purple', text: 'text-electric-purple', bg: 'bg-electric-purple', gradient: 'from-electric-purple/20', hover: 'hover:border-electric-purple' },
  { border: 'neo-border-cyan', glow: 'glow-cyan', text: 'text-neon-cyan', bg: 'bg-neon-cyan', gradient: 'from-neon-cyan/20', hover: 'hover:border-neon-cyan' },
  { border: 'neo-border-pink', glow: 'glow-pink', text: 'text-neon-pink', bg: 'bg-neon-pink', gradient: 'from-neon-pink/20', hover: 'hover:border-neon-pink' },
];

const VIP_MULTIPLIER = 2.5;

// ─── Ticker ─────────────────────────────────────────────────────────────────

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-sm border-b border-white/5 overflow-hidden h-9 flex items-center">
      <div className="ticker-track whitespace-nowrap select-none">
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 mx-6">
            {item}
            <span className="text-acid/40 mx-3">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Navbar ─────────────────────────────────────────────────────────────────

function Navbar({
  currentView, setCurrentView, onLogin,
}: {
  currentView: ViewName;
  setCurrentView: (v: ViewName) => void;
  onLogin: () => void;
}) {
  const navItems: { label: string; key: ViewName }[] = [
    { label: 'Home', key: 'home' },
    { label: 'My Stash', key: 'stash' },
    { label: 'Control Room', key: 'control-room' },
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b border-white/5 bg-zinc-950/60"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => setCurrentView('home')} className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-acid to-neon-cyan flex items-center justify-center">
            <Zap className="w-4 h-4 text-zinc-950" strokeWidth={3} />
          </div>
          <span className="font-display font-black text-lg tracking-wider text-white">
            VENUE<span className="text-acid">VISTA</span>
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map(({ label, key }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className={`hover:text-acid transition-colors duration-200 font-mono text-xs tracking-widest uppercase cursor-pointer ${
                currentView === key ? 'text-acid' : 'text-zinc-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <motion.button
          onClick={onLogin}
          className="glass px-4 py-2 rounded-full text-xs font-mono tracking-widest uppercase text-acid neo-border-acid cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95, y: 2 }}
        >
          Login
        </motion.button>
      </div>

      <div className="md:hidden flex items-center justify-center gap-6 pb-2">
        {navItems.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setCurrentView(key)}
            className={`font-mono text-xs tracking-widest uppercase cursor-pointer ${
              currentView === key ? 'text-acid' : 'text-zinc-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </motion.nav>
  );
}

// ─── Login View ─────────────────────────────────────────────────────────────

function LoginView({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onBack();
    }, 900);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(rgba(163,255,18,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(163,255,18,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-acid/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-electric-purple/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        className="glass rounded-2xl w-full max-w-md p-8 relative z-10 neo-border-acid glow-acid"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-acid to-neon-cyan flex items-center justify-center">
            <Zap className="w-5 h-5 text-zinc-950" strokeWidth={3} />
          </div>
          <span className="font-display font-black text-xl tracking-wider text-white">
            VENUE<span className="text-acid">VISTA</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl bg-white/5 border border-white/10">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className={`py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest uppercase transition-all cursor-pointer ${
                mode === m
                  ? 'bg-gradient-to-r from-acid to-neon-cyan text-zinc-950'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <h2 className="font-display text-2xl font-black text-white mb-1">
          {mode === 'login' ? 'Welcome Back' : 'Join the Underground'}
        </h2>
        <p className="text-sm text-zinc-400 font-mono mb-6">
          {mode === 'login' ? 'Sign in to access your stash.' : 'Create an account. No cap.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-mono text-zinc-400 tracking-widest uppercase mb-2">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-acid/50 transition-colors"
                  placeholder="your_handle"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-zinc-400 tracking-widest uppercase mb-2">
              Email
            </label>
            <div className="relative">
              <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-acid/50 transition-colors"
                placeholder="you@cyber.io"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 tracking-widest uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-acid/50 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-xl bg-neon-pink/10 border border-neon-pink/30 px-4 py-3 text-xs font-mono text-neon-pink"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-acid to-neon-cyan text-zinc-950 font-display font-bold text-sm tracking-widest uppercase disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Processing...</>
            ) : (
              <>{mode === 'login' ? 'Sign In' : 'Create Account'}<ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </form>

        <button
          onClick={onBack}
          className="mt-6 w-full text-center text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
        >
          ← Back to home
        </button>
      </motion.div>
    </div>
  );
}

// ─── Checkout Modal ─────────────────────────────────────────────────────────

function CheckoutModal({
  event, isOpen, onClose, onPurchase,
}: {
  event: MockEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onPurchase: (ticket: MockTicket) => void;
}) {
  const [ticketType, setTicketType] = useState<'GA' | 'VIP'>('GA');
  const [quantity, setQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const eventKey = event?.id ?? '';
  const [lastEventKey, setLastEventKey] = useState('');
  if (isOpen && eventKey !== lastEventKey) {
    setLastEventKey(eventKey);
    setTicketType('GA');
    setQuantity(1);
    setProcessing(false);
    setSuccess(false);
  }

  if (!event) return null;

  const unitPrice = ticketType === 'VIP'
    ? Math.round(event.basePrice * VIP_MULTIPLIER)
    : event.basePrice;
  const total = unitPrice * quantity;

  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const payload = {
        eventId: Number(event.id),
        eventTitle: event.title,
        eventDate: event.date,
        eventVenue: event.venue,
        ticketType,
        quantity,
        unitPrice,
        totalPrice: total,
      };

      const res = await fetch('http://localhost:8080/api/tickets/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Checkout failed');
      const savedTicket = await res.json();

      setProcessing(false);
      setSuccess(true);
      onPurchase({
        id: String(savedTicket.id),
        eventId: String(savedTicket.eventId),
        eventTitle: savedTicket.eventTitle,
        eventDate: savedTicket.eventDate,
        eventVenue: savedTicket.eventVenue,
        ticketType: savedTicket.ticketType,
        quantity: savedTicket.quantity,
        unitPrice: savedTicket.unitPrice,
        totalPrice: savedTicket.totalPrice,
      });

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1400);
    } catch (err) {
      console.error(err);
      setProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="glass rounded-2xl w-full max-w-md p-6 relative neo-border-cyan glow-cyan"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/5 hover:bg-neon-pink/20 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>

            {success ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15 }}
                className="flex flex-col items-center justify-center py-12 gap-4"
              >
                <CheckCircle2 className="w-16 h-16 text-acid glow-acid rounded-full" />
                <p className="font-display text-xl text-acid font-bold">PAYMENT CONFIRMED</p>
                <p className="text-sm text-zinc-400 font-mono">
                  {quantity}x {ticketType} locked in.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="mb-6">
                  <p className="text-xs font-mono text-neon-cyan tracking-widest uppercase mb-1">Checkout</p>
                  <h2 className="font-display text-2xl font-black text-white leading-tight">{event.title}</h2>
                  <p className="text-sm text-zinc-400 mt-1 font-mono">{event.date} · {event.venue}</p>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-mono text-zinc-400 tracking-widest uppercase mb-2">
                    Ticket Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['GA', 'VIP'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setTicketType(type)}
                        className={`px-3 py-3 rounded-xl text-sm font-mono transition-all cursor-pointer ${
                          ticketType === type
                            ? type === 'VIP'
                              ? 'bg-electric-purple/20 neo-border-purple text-white glow-purple'
                              : 'bg-acid/15 neo-border-acid text-acid glow-acid'
                            : 'bg-white/5 border border-white/10 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        {type}
                        <span className="block text-xs text-zinc-500 mt-1">
                          ${type === 'VIP' ? Math.round(event.basePrice * VIP_MULTIPLIER) : event.basePrice}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-mono text-zinc-400 tracking-widest uppercase mb-2">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-acid/50 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4 text-zinc-300" />
                    </button>
                    <span className="font-mono text-2xl font-bold text-white w-12 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 hover:border-acid/50 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-zinc-300" />
                    </button>
                  </div>
                </div>

                <div className="glass rounded-xl p-4 mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-neon-cyan" />
                    <span className="text-sm font-mono text-zinc-400">Total</span>
                  </div>
                  <span className="font-mono text-3xl font-bold text-acid">${total}</span>
                </div>

                <motion.button
                  onClick={handleConfirm}
                  disabled={processing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-acid to-neon-cyan text-zinc-950 font-display font-bold text-sm tracking-widest uppercase disabled:opacity-50 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {processing ? 'Processing...' : 'Confirm Checkout'}
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Event Card ─────────────────────────────────────────────────────────────

function EventCard({
  event, index, onBuy,
}: {
  event: MockEvent;
  index: number;
  onBuy: (e: MockEvent) => void;
}) {
  const accent = ACCENTS[index % ACCENTS.length];
  const soldPct = event.capacity > 0 ? Math.round((event.soldCount / event.capacity) * 100) : 0;
  const isSoldOut = soldPct >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className={`glass rounded-2xl overflow-hidden card-tilt group border-2 border-transparent ${accent.hover} transition-all duration-300 cursor-pointer`}
      onClick={() => !isSoldOut && onBuy(event)}
    >
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        {isSoldOut && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-neon-pink/90 text-white text-xs font-mono font-bold tracking-wider">
            SOLD OUT
          </div>
        )}
        <div className="absolute top-3 left-3 glass rounded-lg px-3 py-1.5">
          <span className={`font-mono text-xs font-bold ${accent.text}`}>{event.date}</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-white leading-tight mb-1">{event.title}</h3>
        <p className={`text-xs font-mono ${accent.text} mb-3`}>{event.artist} · {event.genre}</p>

        <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono mb-1">
          <MapPin className="w-3 h-3" />
          <span>{event.venue}, {event.city}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono mb-4">
          <Calendar className="w-3 h-3" />
          <span>{event.time}</span>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs font-mono text-zinc-500 mb-1">
            <span>{soldPct}% sold</span>
            <span>{event.capacity - event.soldCount} left</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${accent.bg}`}
              initial={{ width: 0 }}
              animate={{ width: `${soldPct}%` }}
              transition={{ duration: 0.8, delay: index * 0.08 + 0.3 }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-zinc-500 block">from</span>
            <span className="font-mono text-xl font-bold text-white">${event.basePrice}</span>
          </div>
          <motion.button
            disabled={isSoldOut}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isSoldOut ? 'bg-white/5 text-zinc-500' : `bg-white/5 ${accent.text} border border-white/10${accent.hover}`
            }`}
            whileHover={isSoldOut ? {} : { scale: 1.05 }}
            whileTap={isSoldOut ? {} : { scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); if (!isSoldOut) onBuy(event); }}
          >
            <Ticket className="w-3.5 h-3.5" />
            {isSoldOut ? 'Sold Out' : 'Buy Ticket'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Home View ──────────────────────────────────────────────────────────────

function HomeView({
  events, onBuy,
}: {
  events: MockEvent[];
  onBuy: (e: MockEvent) => void;
}) {
  return (
    <div className="pt-20">
      <section className="relative min-h-[55vh] flex items-center justify-center overflow-hidden px-4">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(163,255,18,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(163,255,18,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-acid/10 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-electric-purple/10 blur-[120px]" />

        <div className="relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6"
          >
            <Sparkles className="w-4 h-4 text-acid" />
            <span className="text-xs font-mono text-zinc-300 tracking-widest uppercase">
              The Future of Live Events
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-5xl sm:text-7xl font-black leading-[1.1] mb-4"
          >
            <span className="gradient-text">Rule the Venue.</span>
            <br />
            <span className="gradient-text-purple">Own the Vibe.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto mb-8"
          >
            Secure your spot at the most underground, hyper-curated events. No fluff. Just pure energy.
          </motion.p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-acid" />
            <h2 className="font-display text-2xl font-bold text-white">Upcoming Events</h2>
          </div>
          <span className="text-xs font-mono text-zinc-500 tracking-widest uppercase">
            {events.length} events live
          </span>
        </div>

        {events.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <p className="text-zinc-400 font-mono text-sm">No events yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event, i) => (
              <EventCard key={event.id} event={event} index={i} onBuy={onBuy} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ─── My Stash View ──────────────────────────────────────────────────────────

function MyStashView({ tickets }: { tickets: MockTicket[] }) {
  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-white mb-2">
          My <span className="gradient-text">Stash</span>
        </h1>
        <p className="text-zinc-400 font-mono text-sm">
          Your digital tickets. Scan at the gate. No paper, no cap.
        </p>
      </div>

      {tickets.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-2xl p-16 text-center"
        >
          <Ticket className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="font-display text-xl text-zinc-400 font-bold mb-2">Your stash is empty</p>
          <p className="text-sm text-zinc-500 font-mono">Head to Home and grab some tickets.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 30, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ scale: 1.02, rotate: -1 }}
                className={`glass rounded-2xl overflow-hidden ${accent.border} ${accent.glow} transition-shadow`}
              >
                <div className={`bg-gradient-to-r ${accent.gradient} to-transparent px-5 py-3 flex items-center justify-between`}>
                  <span className={`font-mono text-xs font-bold tracking-widest uppercase ${accent.text}`}>
                    {ticket.ticketType}
                  </span>
                  <span className="font-mono text-xs text-zinc-400">{ticket.quantity}x</span>
                </div>

                <div className="p-5">
                  <h3 className="font-display text-xl font-bold text-white leading-tight mb-3">
                    {ticket.eventTitle}
                  </h3>
                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-400 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{ticket.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 font-mono">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{ticket.eventVenue}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                      <div className="qr-pattern absolute inset-2 opacity-80" />
                      <QrCode className={`w-8 h-8 ${accent.text} relative z-10 opacity-60`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-mono text-zinc-500 mb-1">Scan at gate</p>
                      <p className="font-mono text-xs text-zinc-600 break-all">
                        ID: {ticket.id.slice(-8).toUpperCase()}
                      </p>
                      <p className={`font-mono text-lg font-bold ${accent.text} mt-2`}>
                        ${ticket.totalPrice}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-white/10 px-5 py-2 flex justify-between items-center">
                  <span className="font-mono text-xs text-zinc-500">
                    {ticket.ticketType === 'VIP' ? 'VIP ACCESS' : 'GENERAL ADMISSION'}
                  </span>
                  <span className="font-mono text-xs text-zinc-600">
                    {ticket.quantity} {ticket.quantity > 1 ? 'tickets' : 'ticket'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Control Room View ──────────────────────────────────────────────────────

function ControlRoomView({
  events, tickets, onPublish,
}: {
  events: MockEvent[];
  tickets: MockTicket[];
  onPublish: (e: MockEvent) => void;
}) {
  const [form, setForm] = useState({
    title: '', date: '', venue: '', capacity: '', basePrice: '',
  });
  const [publishing, setPublishing] = useState(false);
  const [flash, setFlash] = useState(false);

  const totalRevenue = 14200 + tickets.reduce((s, t) => s + t.totalPrice, 0);
  const ticketsSold = 24531 + tickets.reduce((s, t) => s + t.quantity, 0);
  const activeEvents = events.length;

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, accent: 'text-acid', border: 'neo-border-acid', glow: 'glow-acid' },
    { label: 'Tickets Sold', value: ticketsSold.toLocaleString(), icon: Ticket, accent: 'text-neon-cyan', border: 'neo-border-cyan', glow: 'glow-cyan' },
    { label: 'Active Events', value: activeEvents.toString(), icon: CalendarPlus, accent: 'text-neon-pink', border: 'neo-border-pink', glow: 'glow-pink' },
  ];

  const handlePublish = async () => {
    if (!form.title || !form.date || !form.venue) return;
    setPublishing(true);
    try {
      const payload = {
        title: form.title,
        artist: form.title,
        genre: 'New Drop',
        date: form.date,
        time: '22:00',
        venue: form.venue,
        city: 'TBD',
        basePrice: parseFloat(form.basePrice) || 50,
        capacity: parseInt(form.capacity) || 1000,
        soldCount: 0,
        image: 'https://images.pexels.com/photos/13230484/pexels-photo-13230484.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      };

      const res = await fetch('http://localhost:8080/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Publish failed');
      const savedEvent = await res.json();

      onPublish({
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

      setForm({ title: '', date: '', venue: '', capacity: '', basePrice: '' });
      setPublishing(false);
      setFlash(true);
      setTimeout(() => setFlash(false), 2500);
    } catch (err) {
      console.error(err);
      setPublishing(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm placeholder:text-zinc-600 focus:outline-none focus:border-acid/50 transition-colors';

  return (
    <div className="pt-24 max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div className="mb-10">
        <h1 className="font-display text-4xl font-black text-white mb-2">
          Control <span className="gradient-text">Room</span>
        </h1>
        <p className="text-zinc-400 font-mono text-sm">
          Organizer dashboard. Track revenue, monitor sales, drop new events.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass rounded-2xl p-6 ${stat.border} ${stat.glow}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.accent}`} />
              </div>
            </div>
            <p className="font-mono text-xs text-zinc-500 tracking-widest uppercase mb-1">{stat.label}</p>
            <p className={`font-mono text-3xl font-bold ${stat.accent}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 sm:p-8 neo-border-purple"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-electric-purple/15 flex items-center justify-center">
            <Plus className="w-5 h-5 text-electric-purple" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">Quick Event Creator</h2>
            <p className="text-xs font-mono text-zinc-500">Drop a new event. It goes live instantly.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 tracking-widest uppercase mb-2">Event Title</label>
            <input className={inputClass} placeholder="e.g. Neon Dreams" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-400 tracking-widest uppercase mb-2">Date</label>
            <input className={inputClass} placeholder="e.g. DEC 25" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-400 tracking-widest uppercase mb-2">Venue Name</label>
            <input className={inputClass} placeholder="e.g. Sector 7 Arena" value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-mono text-zinc-400 tracking-widest uppercase mb-2">Total Capacity</label>
            <input className={inputClass} type="number" placeholder="e.g. 5000" value={form.capacity}
              onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-mono text-zinc-400 tracking-widest uppercase mb-2">Base Price ($)</label>
            <input className={inputClass} type="number" placeholder="e.g. 75" value={form.basePrice}
              onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
          </div>
        </div>

        <motion.button
          onClick={handlePublish}
          disabled={publishing || !form.title || !form.date || !form.venue}
          className="w-full mt-6 py-4 rounded-xl bg-gradient-to-r from-electric-purple to-neon-pink text-white font-display font-bold text-sm tracking-widest uppercase disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          {publishing ? <><Loader2 className="w-4 h-4 animate-spin" />Publishing...</>
            : flash ? 'Event Published!'
            : 'Publish Event'}
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── App ────────────────────────────────────────────────────────────────────

function App() {
  const [currentView, setCurrentView] = useState<ViewName>('home');
  const [events, setEvents] = useState<MockEvent[]>([]);
  const [purchasedTickets, setPurchasedTickets] = useState<MockTicket[]>([]);
  const [checkoutEvent, setCheckoutEvent] = useState<MockEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Fetch events and tickets from backend on mount
  useEffect(() => {
    fetch('http://localhost:8080/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formattedEvents: MockEvent[] = data.map((e: any) => ({
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
          }));
          setEvents(formattedEvents);
        }
      })
      .catch((err) => console.error('Failed to fetch events:', err));

    fetch('http://localhost:8080/api/tickets')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formattedTickets: MockTicket[] = data.map((t: any) => ({
            id: String(t.id),
            eventId: String(t.eventId),
            eventTitle: t.eventTitle,
            eventDate: t.eventDate,
            eventVenue: t.eventVenue,
            ticketType: t.ticketType,
            quantity: t.quantity,
            unitPrice: t.unitPrice,
            totalPrice: t.totalPrice,
          }));
          setPurchasedTickets(formattedTickets);
        }
      })
      .catch((err) => console.error('Failed to fetch tickets:', err));
  }, []);

  const handleBuy = (event: MockEvent) => {
    setCheckoutEvent(event);
    setModalOpen(true);
  };

  const handlePurchase = (ticket: MockTicket) => {
    setPurchasedTickets((prev) => [ticket, ...prev]);
  };

  const handlePublish = (event: MockEvent) => {
    setEvents((prev) => [...prev, event]);
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-zinc-950 relative">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-acid/5 blur-[150px]" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full bg-electric-purple/5 blur-[150px]" />
        </div>
        <LoginView onBack={() => setShowLogin(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-acid/5 blur-[150px]" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full bg-electric-purple/5 blur-[150px]" />
      </div>

      <Navbar currentView={currentView} setCurrentView={setCurrentView} onLogin={() => setShowLogin(true)} />
      <Ticker />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {currentView === 'home' && <HomeView events={events} onBuy={handleBuy} />}
            {currentView === 'stash' && <MyStashView tickets={purchasedTickets} />}
            {currentView === 'control-room' && (
              <ControlRoomView events={events} tickets={purchasedTickets} onPublish={handlePublish} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <CheckoutModal
        event={checkoutEvent}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onPurchase={handlePurchase}
      />

      <footer className="relative z-10 border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-sm font-bold text-zinc-500">
            VENUE<span className="text-acid/50">VISTA</span>
          </span>
          <span className="font-mono text-xs text-zinc-600">Built for the underground. No cap.</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
