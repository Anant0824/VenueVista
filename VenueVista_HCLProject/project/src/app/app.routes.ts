import { Routes, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HomeView } from './views/home-view';
import { StashView } from './views/stash-view';
import { ControlRoomView } from './views/control-room-view';
import { LoginView } from './views/login-view';

const creatorGuard = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // 1. If rendering on the server (SSR), allow the route to pass through
  // because localStorage isn't available on the server yet.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // 2. Once running in the browser, safely check localStorage
  const role = localStorage.getItem('role');
  console.log('🛡️ Browser Guard Check - Role:', role);

  if (role === 'ROLE_CREATOR') {
    return true;
  }

  return router.parseUrl('/stash');
};

export const routes: Routes = [
  { path: '', component: HomeView },
  { path: 'stash', component: StashView },
  {
    path: 'control-room',
    component: ControlRoomView,
    canActivate: [creatorGuard]
  },
  { path: 'login', component: LoginView },
  { path: '**', redirectTo: '' },
];
