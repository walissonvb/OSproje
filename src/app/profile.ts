import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  doc,
  setDoc,
  docData
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { Profile } from './interfaces/profile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private firestore = inject(Firestore);

  constructor() {
    console.log(this.firestore)
  }

  // Salvar perfil
async salvarPerfil(profile: Profile): Promise<void> {

  try {

    console.log('A');

    const ref = doc(
      this.firestore,
      `profiles/${profile.uid}`
    );

    console.log('B');

    console.log(ref);

    await setDoc(ref, profile);

    console.log('C');

  } catch (e) {

    console.error('ERRO FIRESTORE');
    console.error(e);

  }

}  // Buscar perfil
  buscarPerfil(uid: string): Observable<any> {

    const ref = doc(
      this.firestore,
      `profiles/${uid}`
    );

    return docData(ref);
  }

}
