import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OsService } from '../os';
import { FirebaseService } from '../firebase';
import { Os } from '../interfaces/os';

import { addIcons } from 'ionicons';
import {
  logOutOutline,
  addCircleOutline
} from 'ionicons/icons';

import {
  IonSelectOption,
  IonButton,
  IonItem,
  IonCardContent,
  IonCardTitle,
  IonCardHeader,
  IonCard,
  IonContent,
  IonIcon,
  IonButtons,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonInput,
  IonSelect,
  IonTextarea
} from "@ionic/angular/standalone";

@Component({
  selector: 'app-ordem-servico-page',
  templateUrl: './ordem-servico-page.page.html',
  styleUrls: ['./ordem-servico-page.page.scss'],
  standalone: true,
  imports: [
    IonSelectOption,
    IonSelect,
    IonTextarea,
    IonInput,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonIcon,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonButton,
    CommonModule,
    FormsModule
  ]
})
export class OrdemServicoPagePage {

  /**
   * Serviço responsável pelo CRUD das Ordens de Serviço.
   */
  private osService = inject(OsService);

  /**
   * Serviço responsável pela autenticação Firebase.
   * Utilizado para obter o usuário logado.
   */
  private authService = inject(FirebaseService);

  /**
   * Controla o formulário em duas etapas.
   *
   * Etapa 1:
   *  - Tipo do usuário
   *  - Natureza do chamado
   *
   * Etapa 2:
   *  - Urgência
   *  - Descrição
   */
  etapa = 1;

  /**
   * Ordem localizada pela pesquisa de protocolo.
   * Será utilizada posteriormente para atualização do status.
   */
  ordemEncontrada: Os | null = null;

  /**
   * Novo status escolhido pelo responsável pela manutenção.
   */
novoStatus: 'pendente' | 'em andamento' | 'concluída' = 'em andamento';
  /**
   * Modelo da nova Ordem de Serviço.
   *
   * Os dados são preenchidos pelo formulário
   * antes de serem enviados ao Firestore.
   */
  novaOrdem: Partial<Os> = {
    tipoUsuario: 'empresa',
    setor: '',
    local: '',
    natureza: '',
    urgencia: 'Posso Esperar',
    descricao: '',
    nomeUsuario: ''
  };

  /**
   * Lista de usuários autorizados a alterar o status das OS.
   *
   * Apenas supervisores ou prestadores autorizados
   * devem possuir seus UIDs cadastrados aqui.
   */
  private idsAutorizados: string[] = [
    "4o4vOu8BjaVNDpp2c4WYGWsSL9G2"
    // adicionar outros UIDs autorizados
  ];

  constructor() {
    addIcons({
      logOutOutline,
      addCircleOutline
    });
  }

  /**
   * Avança para a segunda etapa do formulário.
   *
   * Antes de continuar verifica se os campos
   * obrigatórios da primeira etapa foram preenchidos.
   */
  proximaEtapa() {

    if (!this.novaOrdem.tipoUsuario || !this.novaOrdem.natureza) {

      alert('Preencha os campos obrigatórios da Etapa 1');
      return;

    }

    this.etapa = 2;

  }

  /**
   * Cria uma nova Ordem de Serviço.
   *
   * Fluxo:
   *
   * 1 - Valida os campos obrigatórios.
   * 2 - Obtém o usuário autenticado.
   * 3 - Salva a OS no Firestore.
   * 4 - Salva uma mensagem na coleção "messages".
   * 5 - Abre automaticamente o WhatsApp com a mensagem pronta.
   * 6 - Limpa o formulário.
   *
   */
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

      const resultado = await this.osService.criarOS(os as Os);

      /**
       * Número responsável por receber
       * todas as novas Ordens de Serviço.
       */
      const numero = '5531999184578';

      /**
       * Codifica o texto para ser enviado
       * corretamente na URL do WhatsApp.
       */
      const texto = encodeURIComponent(resultado.mensagem);

      /**
       * Abre o WhatsApp já com a mensagem preenchida.
       *
       * O usuário apenas confirma o envio.
       */
      window.open(
        `https://wa.me/${numero}?text=${texto}`,
        '_blank'
      );

      alert(
        `✅ Ordem aberta com sucesso!\nProtocolo: ${resultado.protocolo}`
      );

      /**
       * Reinicia o formulário para uma nova OS.
       */
      this.novaOrdem = {

        tipoUsuario: 'empresa',
        setor: '',
        local: '',
        natureza: '',
        urgencia: 'Emergência',
        descricao: ''

      };

      this.etapa = 1;

    } catch (error) {

      console.error(error);
      alert('Erro ao abrir a ordem');

    }

  }

  /**
   * Verifica se o usuário possui permissão
   * para atualizar Ordens de Serviço.
   */
  isUsuarioAutorizado(uid: string): boolean {

    return this.idsAutorizados.includes(uid);

  }

  /**
   * Atualiza o status de uma Ordem de Serviço.
   *
   * Apenas usuários autorizados podem executar
   * esta operação.
   */
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

    } catch {

      alert('Erro ao atualizar status');

    }

  }

  /**
   * Encerra a sessão do usuário.
   */
  logout() {

    this.authService.logout();

  }

}
