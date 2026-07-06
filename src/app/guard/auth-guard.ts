import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { FirebaseService } from '../firebase'; // ajuste o caminho
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(FirebaseService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),   // Pega apenas o primeiro valor
    map(user => {
      if (user) {
        return true;                    // Usuário logado → permite acesso
      } else {
        // Redireciona para login e salva a URL que ele tentou acessar
        router.navigate(['/login-page'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
    })
  );
};
