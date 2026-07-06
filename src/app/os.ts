import { Os } from './interfaces/os';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Firestore,
  collection,
  addDoc,
  serverTimestamp,
  collectionData,
  query,
  where,
  doc,
  getDoc,
  updateDoc
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class OsService {

  private firestore = inject(Firestore);

  listarMinhasOS(uid: string): Observable<Os[]> {
    const ref = collection(this.firestore, 'ordens_servico');
    const q = query(ref, where('uid', '==', uid));

    return collectionData(q, { idField: 'protocolo' }) as Observable<Os[]>;
  }

  async buscarPorProtocolo(protocolo: string): Promise<Os | null> {
    const ordemRef = doc(this.firestore, 'ordens_servico', protocolo);
    const snap = await getDoc(ordemRef);

    if (!snap.exists()) return null;

    return {
      protocolo: snap.id,
      ...(snap.data() as Os)
    };
  }

  async criarOS(os: Os): Promise<string> {
    os.dataAbertura = serverTimestamp();
    os.status = 'Pendente';

    const ref = collection(this.firestore, 'ordens_servico');
    const docRef = await addDoc(ref, os);

    os.protocolo = docRef.id;

    await this.enviarNotificacaoSMS(os);

    return docRef.id;
  }

  async atualizarStatus(protocolo: string, status: string, uid: string): Promise<void> {
    const ordemRef = doc(this.firestore, 'ordens_servico', protocolo);

    await updateDoc(ordemRef, {
      status,
      ultimaAtualizacao: serverTimestamp(),
      atualizadoPor: uid
    });
  }

  private async enviarNotificacaoSMS(os: Os) {
    const messagesRef = collection(this.firestore, 'messages');

    let telefoneDestino = '+5531999184578';

    if (os.natureza?.toLowerCase().includes('mec')) {
      telefoneDestino = '+5531999184578';
    } else if (os.natureza?.toLowerCase().includes('el')) {
      telefoneDestino = '+5531999184578';
    } else {
      telefoneDestino = '+5531999184578';
    }

    const mensagem = `🚨 NOVA ORDEM DE SERVIÇO\n\nProtocolo: ${os.protocolo}\nTipo: ${os.tipoUsuario === 'empresa' ? 'Empresa' : 'Condomínio'}\nLocal/Setor: ${os.setor || os.local}\nUrgência: ${os.urgencia}\nDescrição: \( {os.descricao?.substring(0, 100)} \){os.descricao?.length > 100 ? '...' : ''}`;

    await addDoc(messagesRef, {
      to: telefoneDestino,
      body: mensagem
    });
  }
}
