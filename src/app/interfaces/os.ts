import { Timestamp } from '@angular/fire/firestore';

export interface Os {

  protocolo?: string;

  uid: string;

  nomeUsuario: string;

  tipoUsuario: 'empresa' | 'condominio';

  empresa?: string;

  setor?: string;

  local?: string;

  natureza: string;

  escalaPrioridade: string;

  descricao: string;

  status:
    | 'pendente'
    | 'em andamento'
    | 'concluída';

  dataAbertura?: Timestamp;

  dataFechamento?: string;

  ultimaAtualizacao?: Timestamp;

  atualizadoPor?: string;

}
