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

async criarOS(os: Os): Promise<{ protocolo: string; mensagem: string }> {

  os.dataAbertura = serverTimestamp();
  os.status = 'Pendente';

  const ref = collection(this.firestore, 'ordens_servico');
  const docRef = await addDoc(ref, os);

  os.protocolo = docRef.id;

  const mensagem = await this.enviarNotificacao(os);

  return {
    protocolo: docRef.id,
    mensagem
  };

}
  async atualizarStatus(protocolo: string, status: string, uid: string): Promise<void> {
    const ordemRef = doc(this.firestore, 'ordens_servico', protocolo);

    await updateDoc(ordemRef, {
      status,
      ultimaAtualizacao: serverTimestamp(),
      atualizadoPor: uid
    });
  }


private async enviarNotificacao(os: Os): Promise<string> {

  const messagesRef = collection(this.firestore, 'messages');

  const telefoneDestino = '5531999184578';

  const mensagem =
`🚨 *NOVA ORDEM DE SERVIÇO*

📋 Protocolo: ${os.protocolo}

🏢 Tipo:
${os.tipoUsuario === 'empresa' ? 'Empresa' : 'Condomínio'}

📍 Local/Setor:
${os.setor || os.local}

⚙️ Natureza:
${os.natureza}

🚨 Urgência:
${os.urgencia}

📝 Descrição:
${os.descricao}`;

  await addDoc(messagesRef, {
    protocolo: os.protocolo,
    to: telefoneDestino,
    body: mensagem,
    data: serverTimestamp(),
    enviado: false
  });

  return mensagem;

}}
