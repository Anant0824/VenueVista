import { Accent } from './models';
import { environment } from '../environments/environment';

export const TICKER_ITEMS = [
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

export const ACCENTS: Accent[] = [
  { border: 'neo-border-acid', glow: 'glow-acid', text: 'text-acid', bg: 'bg-acid', gradient: 'from-acid/20', hover: 'hover:border-acid' },
  { border: 'neo-border-purple', glow: 'glow-purple', text: 'text-electric-purple', bg: 'bg-electric-purple', gradient: 'from-electric-purple/20', hover: 'hover:border-electric-purple' },
  { border: 'neo-border-cyan', glow: 'glow-cyan', text: 'text-neon-cyan', bg: 'bg-neon-cyan', gradient: 'from-neon-cyan/20', hover: 'hover:border-neon-cyan' },
  { border: 'neo-border-pink', glow: 'glow-pink', text: 'text-neon-pink', bg: 'bg-neon-pink', gradient: 'from-neon-pink/20', hover: 'hover:border-neon-pink' },
];

export const VIP_MULTIPLIER = 2.5;

export const API_BASE = environment.apiBaseUrl;
