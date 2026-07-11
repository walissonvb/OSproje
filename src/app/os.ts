import { Injectable, inject } from '@angular/core';

import {
Firestore,
collection,
collectionData,
query,
where,
doc,
getDoc,
updateDoc,
addDoc,
serverTimestamp,
orderBy,
limit
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

import { Os } from './interfaces/os';

@Injectable({
providedIn:'root'
})
export class OsService{

private firestore = inject(Firestore);

listarMinhasOS(uid:string):Observable<Os[]>{

const ref = collection(this.firestore,'ordens_servico');

const q=query(
ref,
where('uid','==',uid),
orderBy('dataAbertura','desc')
);

return collectionData(
q,
{idField:'protocolo'}
) as Observable<Os[]>;

}

listarUltimasOrdens():Observable<Os[]>{

const ref=collection(this.firestore,'ordens_servico');

const q=query(
ref,
orderBy('dataAbertura','desc'),
limit(10)
);

return collectionData(
q,
{idField:'protocolo'}
) as Observable<Os[]>;

}

async buscarPorProtocolo(protocolo:string){

const ref=doc(
this.firestore,
'ordens_servico',
protocolo
);

const snap=await getDoc(ref);

if(!snap.exists()) return null;

return{

protocolo:snap.id,

...(snap.data() as Os)

};

}

async criarOS(os: Os): Promise<{ protocolo: string; mensagem: string }> {

  const dados = {
    ...os,
    status: 'pendente',
    dataAbertura: serverTimestamp()
  };

  const ref = collection(this.firestore, 'ordens_servico');

  const docRef = await addDoc(ref, dados);

  os.protocolo = docRef.id;

  const mensagem = this.gerarMensagem(os);

  await this.salvarMensagem(mensagem, docRef.id);

  return {
    protocolo: docRef.id,
    mensagem
  };
}
async atualizarStatus(

protocolo:string,

status:'pendente'|'em andamento'|'concluída',

uid:string

){

const ref=doc(

this.firestore,

'ordens_servico',

protocolo

);

await updateDoc(ref,{

status,

ultimaAtualizacao:serverTimestamp(),

atualizadoPor:uid

});

}

private gerarMensagem(os:Os){

return `🚨 NOVA ORDEM DE SERVIÇO

📋 Protocolo: ${os.protocolo}

📍 Local:
${os.setor||os.local}

⚙ Natureza:
${os.natureza}

🚨 Urgência:
${os.urgencia}

📝 ${os.descricao}`;

}

private async salvarMensagem(

mensagem:string,

protocolo:string

){

const ref=collection(

this.firestore,

'messages'

);

await addDoc(ref,{

protocolo,

body:mensagem,

to:'5531999184578',

enviado:false,

dataCriacao:serverTimestamp()

});

}

}
