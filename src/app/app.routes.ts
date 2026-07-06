import { Routes } from '@angular/router';
import { authGuard } from './guard/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home-page', pathMatch: 'full' },

  {
    path: 'login-page',
    loadComponent: () => import('./login-page/login-page.page').then(m => m.LoginPage)
  },

  {
    path: 'home-page',
    loadComponent: () => import('./home-page/home-page.page').then(m => m.HomePage),
    canActivate: [authGuard]
  },

  {
    path: 'ordem-servico',
    loadComponent: () => import('./ordem-servico-page/ordem-servico-page.page').then(m => m.OrdemServicoPagePage),
    canActivate: [authGuard]
  },

  {
    path: 'report-page',
    loadComponent: () => import('./report-page/report-page.page').then(m => m.ReportPagePage),
    canActivate: [authGuard]
  },

  // Wildcard deve ir para login ou home, NUNCA para uma página protegida
{
  path: '**',
  redirectTo: 'home-page'
}
];
