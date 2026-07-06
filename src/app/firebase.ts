import { Injectable, inject } from '@angular/core';

import {
  Auth,
  authState,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private auth = inject(Auth);

  user$ = authState(this.auth);

  login(email: string, password: string) {
    return signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
  }

  loginGoogle() {
    return signInWithPopup(
      this.auth,
      new GoogleAuthProvider()
    );
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(
      this.auth,
      email
    );
  }
  getCurrentUser() {
    return this.auth.currentUser;
  }

  logout() {
    return signOut(this.auth);
  }

}
