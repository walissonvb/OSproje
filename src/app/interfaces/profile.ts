export interface Profile {
  uid: string;
  nome: string;
  empresa?: string;
  cargo?: string;
  condominio?: string;
  bloco?: string;
  apartamento?: string;
  tipoUsuario: 'empresa' | 'condominio';
  firtUser: boolean;
}
