import { Component } from '@angular/core';
import { TICKER_ITEMS } from '../constants';

@Component({
  selector: 'app-ticker',
  template: `
    <div class="fixed top-16 left-0 right-0 z-40 bg-zinc-950/80 backdrop-blur-sm border-b border-white/5 overflow-hidden h-9 flex items-center">
      <div class="ticker-track whitespace-nowrap select-none">
        @for (item of items; track $index) {
          <span class="inline-flex items-center gap-1 font-mono text-xs text-zinc-400 mx-6">
            {{ item }}
            <span class="text-acid/40 mx-3">◆</span>
          </span>
        }
      </div>
    </div>
  `,
})
export class Ticker {
  readonly items = [...TICKER_ITEMS, ...TICKER_ITEMS];
}
