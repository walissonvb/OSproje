import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Chart from 'chart.js/auto';

import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonIcon,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonCardContent,
  IonCard,
  IonList,
  IonLabel,
  IonInput,
  ToastController,

} from '@ionic/angular/standalone';
import { Auth } from '@angular/fire/auth';
import { Profile } from '../interfaces/profile';
import { Os } from '../interfaces/os';
import { OsService } from '../os';
import { FirebaseService } from '../firebase';
/**
 * -----------------------------------------------------------------------------
 * ReportPagePage
 * -----------------------------------------------------------------------------
 *
 * Esta página concentra a visualização das Ordens de Serviço já abertas.
 *
 * Objetivos principais:
 *  - Buscar uma ordem pelo protocolo.
 *  - Exibir os detalhes da ordem encontrada.
 *  - Preparar a tela para futuras ações administrativas.
 *  - Servir como base para relatórios, filtros e acompanhamento.
 *
 * Responsabilidade da página:
 *  - Apresentar dados.
 *  - Chamar o serviço responsável pelo Firestore.
 *  - Não concentrar regras de acesso complexas aqui.
 *
 * Regra geral do projeto:
 *  - A página controla a interface.
 *  - O serviço controla o acesso aos dados.
 * -----------------------------------------------------------------------------
 */
@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.page.html',
  styleUrls: ['./report-page.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonLabel,
    IonInput,
    IonList,
    IonCard,
    IonCardContent,
    IonItem,
    IonCardTitle,
    IonCardHeader,
    IonIcon,
    IonButton,
    IonButtons,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule
  ]
})
export class ReportPagePage implements OnInit, AfterViewInit {

  /**
   * Perfil do usuário logado.
   *
   * Este objeto pode ser usado no futuro para:
   *  - mostrar nome do usuário;
   *  - controlar permissão de acesso;
   *  - filtrar ordens por empresa ou condomínio.
   */
  profile: Profile = {
    uid: '',
    nome: '',
    empresa: '',
    cargo: 'terceiro',
    condominio: '',
    tipoUsuario: 'empresa',
    bloco: '',
    apartamento: '',
    firtUser: true
  };
  userType: 'empresa' | 'condominio' = 'empresa';

  /**
   * Campo utilizado para pesquisar uma OS pelo protocolo.
   * O usuário digita o número e a página consulta o serviço.
   */
  protocoloBusca = '';

  /**
   * Armazena a ordem encontrada após a busca.
   * Se não houver resultado, permanece null.
   */
  ordemEncontrada: Os | null = null;

  /**
   * Contadores para uso futuro em gráficos ou resumos.
   * Ainda não estão sendo preenchidos nesta versão.
   */
  pendentes = 0;
  andamento = 0;
  concluidas = 0;

  /**
   * Lista geral de ordens.
   * Pode ser usada futuramente para filtros,
   * relatórios ou visualização em lista.
   */
  ordens: Os[] = [];

  /**
   * Serviço responsável por acessar o Firestore
   * e executar consultas relacionadas às Ordens de Serviço.
   */
  private osService = inject(OsService);
  /**
   * Serviço responsável pela autenticação Firebase.
   * Utilizado para obter o usuário logado.
   */
  private authService = inject(FirebaseService);
    grafico: Chart | undefined;

  @ViewChild('graficoOS')
  graficoCanvas!: ElementRef<HTMLCanvasElement>;
private toastCtrl = inject(ToastController);
private auth = inject(Auth);

  constructor() { }

  /**
   * Ciclo de vida executado quando a página é carregada.
   *
   * Nesta implementação ainda não há lógica automática.
   * Mais tarde este ponto pode ser usado para:
   *  - carregar dados do usuário;
   *  - buscar listas iniciais;
   *  - validar permissões de acesso;
   *  - preencher contadores e gráficos.
   */
  ngOnInit() {
          this.carregarOrdens();   // Carrega ordens após verificar perfil

  }

  /**
   * Busca uma Ordem de Serviço pelo protocolo informado.
   *
   * Fluxo:
   *  1. Verifica se o campo foi preenchido.
   *  2. Chama o serviço que consulta o Firestore.
   *  3. Se encontrar a OS, armazena em ordemEncontrada.
   *  4. Se não encontrar, avisa o usuário.
   *  5. Em caso de erro, exibe uma mensagem genérica.
   */
  async buscarOrdem() {

    if (!this.protocoloBusca.trim()) {
      alert('Digite o número do protocolo');
      return;
    }

    try {
      this.ordemEncontrada =
        await this.osService.buscarPorProtocolo(
          this.protocoloBusca
        );

      if (!this.ordemEncontrada) {
        alert('Ordem não encontrada');
      }

    } catch (error) {
      console.error(error);
      alert('Erro ao buscar ordem');
    }
  }
carregarOrdens() {
    const uid = this.auth.currentUser?.uid;

    if (!uid) return;

    this.osService
      .listarMinhasOS(uid)
      .subscribe({

        next: (dados) => {

          this.ordens = dados;

          this.contabilizarStatus();

          setTimeout(() => {
            this.gerarGrafico();
          }, 300);

        },

        error: (erro) => {

            console.error('ERRO FIRESTORE', erro);

  alert(JSON.stringify(erro));

          this.showToast(
            'Erro ao carregar ordens.',
            'danger'
          );

        }

      });

  }
  async showToast(
    mensagem: string,
    color: string
  ) {

    const toast =
      await this.toastCtrl.create({

        message: mensagem,
        duration: 3000,
        color,
        position: 'top'

      });

    await toast.present();

  }


/**
 * Conta quantas Ordens existem
 * em cada status.
 *
 * Esses valores são utilizados
 * pelo gráfico da Dashboard.
 */
contabilizarStatus(){

this.pendentes=

this.ordens.filter(

o=>o.status==='pendente'

).length;

this.andamento=

this.ordens.filter(

o=>o.status==='em andamento'

).length;

this.concluidas=

this.ordens.filter(

o=>o.status==='concluída'

).length;

}  /**
   * Método reservado para logout.
   *
   * Pode ser ligado ao serviço de autenticação quando for implementado
   * o fluxo completo de sair do sistema.
   */
  /**
 * O gráfico somente pode ser criado
 * depois que o Canvas estiver renderizado.
 *
 * Por isso o gráfico é criado no AfterViewInit.
 */
ngAfterViewInit(): void {
    setTimeout(() => {
      this.gerarGrafico();
    }, 500);

  }

  onUserTypeChange() {

    this.profile.tipoUsuario = this.userType;

    console.log(this.userType);

  }
gerarGrafico() {

    if (!this.graficoCanvas) return;

    if (this.grafico) {
      this.grafico.destroy();
    }

    const ctx =
      this.graficoCanvas
        .nativeElement
        .getContext('2d');

    if (!ctx) return;

    this.grafico = new Chart(ctx, {

      type: 'doughnut',

      data: {

        labels: [
          'Pendentes',
          'Em andamento',
          'Concluídas'
        ],

        datasets: [{
          data: [
            this.pendentes,
            this.andamento,
            this.concluidas
          ]
        }]

      },

      options: {

        responsive: true,

        plugins: {
          legend: {
            position: 'bottom'
          }
        }

      }

    });

  }

  logout() {

    this.authService.logout();

  }
}
