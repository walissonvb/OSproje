import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { RouteReuseStrategy } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideRouter } from '@angular/router';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth, initializeAuth, indexedDBLocalPersistence } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
// Caso queira usar Storage futuramente:
// import { provideStorage, getStorage } from '@angular/fire/storage';

import { Capacitor } from '@capacitor/core';
import { getApp } from 'firebase/app';

import { environment } from './environments/environment';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

// ✅ Habilita locale PT-BR para pipes de data/número
registerLocaleData(localePt);

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),

    // 🔥 Firebase App
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),

    // 🔑 Auth com suporte nativo (Android/iOS)
    provideAuth(() => {
      if (Capacitor.isNativePlatform()) {
        return initializeAuth(getApp(), {
          persistence: indexedDBLocalPersistence
        });
      }
      return getAuth();
    }),

    // 📂 Firestore
    provideFirestore(() => getFirestore()),

    // 📦 Storage (se precisar no futuro)
    // provideStorage(() => getStorage()),
  ]
}).catch(err => console.error('❌ Erro ao inicializar aplicação:', err));
