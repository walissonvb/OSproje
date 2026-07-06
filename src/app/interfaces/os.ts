export interface Os {
  uid: string;
  protocolo?: string;
  tipoUsuario: 'empresa' | 'condominio';
  setor?: string;
  local? : string;
  natureza: string;
  urgencia: 'Urgência' | 'Emergência' | 'Posso Esperar';
  descricao: string;
  status: string;
  dataAbertura?: any;
  nomeUsuario?: string;
}
