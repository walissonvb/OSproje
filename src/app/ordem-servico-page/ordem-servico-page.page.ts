import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OsService } from '../os';
import { FirebaseService } from '../firebase';
import { Os } from '../interfaces/os';

import { addIcons } from 'ionicons';
import { logOutOutline, addCircleOutline } from 'ionicons/icons';
import { IonSelectOption, IonButton, IonItem, IonCardContent, IonCardTitle, IonCardHeader, IonCard, IonContent, IonIcon, IonButtons, IonTitle, IonToolbar, IonHeader, IonInput, IonSelect, IonTextarea } from "@ionic/angular/standalone";

@Component({
  selector: 'app-ordem-servico-page',
  templateUrl: './ordem-servico-page.page.html',
  styleUrls: ['./ordem-servico-page.page.scss'],
  standalone: true,
  imports: [IonSelectOption,IonSelect, IonTextarea, IonInput,IonHeader, IonToolbar, IonTitle, IonButtons, IonIcon, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonItem, IonButton,
    CommonModule,
    FormsModule,
  ]
})
export class OrdemServicoPagePage {

  private osService = inject(OsService);
  private authService = inject(FirebaseService);

  etapa = 1;
  protocoloBusca = '';
  ordemEncontrada: Os | null = null;
  novoStatus = 'Em Andamento';

  novaOrdem: Partial<Os> = {
    tipoUsuario: 'empresa',
    setor: '',
    local: '',
    natureza: '',
    urgencia: 'Posso Esperar',
    descricao: '',
    nomeUsuario: '',
  };

  private idsAutorizados: string[] = [
    "4o4vOu8BjaVNDpp2c4WYGWsSL9G2",
    // adicione mais IDs autorizados aqui
  ];

  constructor() {
    addIcons({ logOutOutline, addCircleOutline });
  }

  // ====================== BUSCAR ORDEM ======================
  async buscarOrdem() {
    if (!this.protocoloBusca.trim()) {
      alert('Digite o número do protocolo');
      return;
    }

    try {
      this.ordemEncontrada = await this.osService.buscarPorProtocolo(this.protocoloBusca);

      if (!this.ordemEncontrada) {
        alert('Ordem não encontrada');
      }
    } catch (error) {
      console.error(error);
      alert('Erro ao buscar ordem');
    }
  }

  // ====================== ABRIR NOVA ORDEM ======================
  proximaEtapa() {
    if (!this.novaOrdem.tipoUsuario || !this.novaOrdem.natureza) {
      alert('Preencha os campos obrigatórios da Etapa 1');
      return;
    }
    this.etapa = 2;
  }

  async abrirNovaOrdem() {
    if (!this.novaOrdem.descricao || !this.novaOrdem.urgencia) {
      alert('Preencha a descrição e urgência');
      return;
    }

    const user = this.authService.getCurrentUser();
    if (!user?.uid) {
      alert('Usuário não autenticado');
      return;
    }

    const os: Partial<Os> = {
      ...this.novaOrdem,
      uid: user.uid,
      nomeUsuario: user.displayName || 'Usuário'
    };

    try {
      const protocolo = await this.osService.criarOS(os as Os);
      alert(`✅ Ordem aberta com sucesso!\nProtocolo: ${protocolo}`);

      this.novaOrdem = { tipoUsuario: 'empresa', setor: '', local: '', natureza: '', urgencia: 'Emergência', descricao: '' };
      this.etapa = 1;
    } catch (error) {
      console.error(error);
      alert('Erro ao abrir a ordem');
    }
  }

  // ====================== ATUALIZAR STATUS ======================
  isUsuarioAutorizado(uid: string): boolean {
    return this.idsAutorizados.includes(uid);
  }

  async atualizarStatus() {
    if (!this.ordemEncontrada) return;

    const user = this.authService.getCurrentUser();
    if (!user || !this.isUsuarioAutorizado(user.uid)) {
      alert('Você não tem permissão para atualizar esta ordem.');
      return;
    }

    try {
      await this.osService.atualizarStatus(
        this.ordemEncontrada.protocolo!,
        this.novoStatus,
        user.uid
      );

      alert(`✅ Status atualizado para: ${this.novoStatus}`);
      this.ordemEncontrada = null;
    } catch (error) {
      alert('Erro ao atualizar status');
    }
  }

  logout() {
    this.authService.logout();
  }
}
