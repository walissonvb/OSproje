import {
  Component,
  OnInit,
  AfterViewInit,
  inject,
  ViewChild,
  ElementRef
} from '@angular/core';
import { ProfileService } from '../profile';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonSegment,
  IonSegmentButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  ToastController,
  LoadingController, IonModal } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  logOutOutline,
  addCircleOutline
} from 'ionicons/icons';

import { Auth } from '@angular/fire/auth';

import Chart from 'chart.js/auto';

import { OsService } from '../os';
import { FirebaseService } from '../firebase';

import { Os } from '../interfaces/os';
import { Profile } from '../interfaces/profile';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.page.html',
  styleUrls: ['./home-page.page.scss'],
  standalone: true,

  imports: [IonModal,
    CommonModule,
    FormsModule,

    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButton,
    IonButtons,
    IonIcon,
    IonList,

    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,

    IonItem,
    IonLabel,

    IonSegment,
    IonSegmentButton,

    IonInput,
    IonSelect,
    IonSelectOption
  ]
})
export class HomePage implements OnInit, AfterViewInit {
/**
 * Serviço responsável pelo CRUD do perfil do usuário.
 */
private profileService = inject(ProfileService);

/**
 * Serviço responsável pelo CRUD das Ordens de Serviço.
 */
private osService = inject(OsService);

/**
 * Instância do Firebase Authentication.
 */
private auth = inject(Auth);

/**
 * Serviço de navegação entre páginas.
 */
private router = inject(Router);

/**
 * Responsável pelas mensagens Toast.
 */
private toastCtrl = inject(ToastController);

/**
 * Serviço de autenticação da aplicação.
 */
private loginService = inject(FirebaseService);

/**
 * Loading exibido durante carregamentos.
 */
private loadingCtrl = inject(LoadingController);/**
 * Lista de usuários que possuem acesso às funcionalidades
 * administrativas da aplicação.
 *
 * Apenas usuários cujo UID esteja nesta lista
 * visualizarão o botão "Informações"
 * e poderão acessar funcionalidades restritas.
 */
private idsAutorizados: string[] = [
  '4o4vOu8BjaVNDpp2c4WYGWsSL9G2',
  'OUTRO_ID_AUTORIZADO'
];
  ordemEncontrada: Os | null = null;
  ordens: Os[] = [];
  protocoloBusca = '';

  profile: Profile = {
    uid: '',
    nome: '',
    empresa: '',
    cargo: '',
    condominio: '',
    bloco: '',
    apartamento: '',
    tipoUsuario: 'empresa',
    firtUser: true,
  };

  userType: 'empresa' | 'condominio' = 'empresa';

  showProfileForm = true;        // Controla se mostra o formulário
  isLoading = true;              // Novo: controle de carregamento
  mostrarBotaoInformacoes = true;

  pendentes = 0;
  andamento = 0;
  concluidas = 0;
  mostrarUltimasOrdens = false;
  ultimasOrdens: Os[] = [];

  grafico: Chart | undefined;

  @ViewChild('graficoOS')
  graficoCanvas!: ElementRef<HTMLCanvasElement>;

  constructor() {

    addIcons({
      logOutOutline,
      addCircleOutline
    });

  }
/**
 * Inicialização da tela.
 *
 * Fluxo:
 *
 * 1 - Verifica usuário autenticado.
 * 2 - Exibe ou oculta o botão Informações.
 * 3 - Carrega o perfil do Firestore.
 * 4 - Caso seja o primeiro acesso,
 *     exibe o formulário de cadastro.
 * 5 - Após carregar o perfil,
 *     busca as Ordens de Serviço.
 */
async ngOnInit() {
   this.loginService.user$.subscribe(user => {

    this.mostrarBotaoInformacoes =
      !!user && this.idsAutorizados.includes(user.uid);

  });


  const loading = await this.loadingCtrl.create({
    message: 'Carregando perfil...'
  });
  await loading.present();

  try {
    // Aguarda usuário autenticado
    const user = await this.loginService.getCurrentUser();

    if (!user) {
      this.router.navigateByUrl('/login-page', { replaceUrl: true });
      return;
    }

    this.profile.uid = user.uid;

    // Carrega o perfil do Firestore
    this.profileService.buscarPerfil(user.uid).subscribe({
      next: (perfilSalvo: Profile | undefined) => {

        if (perfilSalvo && perfilSalvo.firtUser === true) {   // ← Correção aqui
          this.profile = perfilSalvo;
          this.showProfileForm = false;
          this.userType = perfilSalvo.tipoUsuario || 'empresa';
        } else {
          this.showProfileForm = true;
        }

        this.carregarOrdens();   // Carrega ordens após verificar perfil
      },
      error: (erro) => {
        console.error('Erro ao buscar perfil:', erro);
        this.showProfileForm = true; // Mostra formulário se der erro
      }
    });

  } catch (error) {
    console.error(error);
    await this.showToast('Erro ao carregar dados', 'danger');
    this.showProfileForm = true;
  } finally {
    await loading.dismiss();
  }

}
abrirUltimasOrdens() {

  this.osService
    .listarUltimasOrdens()
    .subscribe(ordens => {

      this.ultimasOrdens = ordens;

      this.mostrarUltimasOrdens = true;

    });

}
fecharUltimasOrdens() {

  this.mostrarUltimasOrdens = false;

}
/**
 * Procura uma Ordem de Serviço pelo protocolo informado.
 *
 * Caso exista:
 *     carrega os dados da OS.
 *
 * Caso contrário:
 *     informa que a ordem não foi encontrada.
 */
async buscarOrdem() {    if (!this.protocoloBusca.trim()) {
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
/**
 * Navega para a página administrativa
 * contendo informações e relatórios.
 *
 * O botão somente é exibido para
 * usuários presentes na lista idsAutorizados.
 */
reportPage(): void {
    this.router.navigateByUrl('/report-page');
}
/**
 * Busca todas as Ordens de Serviço
 * pertencentes ao usuário autenticado.
 *
 * Após receber os dados:
 *
 * - atualiza a lista
 * - contabiliza os status
 * - recria o gráfico
 */
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

          console.log(erro);

          this.showToast(
            'Erro ao carregar ordens.',
            'danger'
          );

        }

      });

  }

/**
 * Conta quantas Ordens existem
 * em cada status.
 *
 * Esses valores são utilizados
 * pelo gráfico da Dashboard.
 */
contabilizarStatus() {
    this.pendentes =
      this.ordens.filter(
        x => x.status === 'Pendente'
      ).length;

    this.andamento =
      this.ordens.filter(
        x => x.status === 'Em Andamento'
      ).length;

    this.concluidas =
      this.ordens.filter(
        x => x.status === 'Concluída'
      ).length;

  }
/**
 * Gera o gráfico Doughnut utilizando Chart.js.
 *
 * O gráfico apresenta:
 *
 * • Pendentes
 * • Em andamento
 * • Concluídas
 *
 * Sempre que novas ordens forem carregadas,
 * o gráfico é destruído e recriado
 * para refletir os dados atuais.
 */
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
/**
 * Salva o perfil do usuário no Firestore.
 *
 * Fluxo:
 *
 * 1 - Verifica autenticação.
 * 2 - Associa o UID ao perfil.
 * 3 - Valida os campos obrigatórios.
 * 4 - Salva no Firestore.
 * 5 - Esconde o formulário.
 *
 * O cadastro é realizado apenas
 * no primeiro acesso do usuário.
 */
async salvarPerfil() {

  console.log('===== INÍCIO salvarPerfil =====');

  // Verifica se existe usuário logado
  const usuario = this.auth.currentUser;

  if (!usuario) {
    console.error('Nenhum usuário autenticado.');
    await this.showToast('Usuário não autenticado.', 'danger');
    return;
  }

  // Garante que o UID será salvo
  this.profile.uid = usuario.uid;

  console.log('Perfil que será salvo:', this.profile);

  // Validação simples
  if (!this.profile.nome) {
    await this.showToast('Informe seu nome.', 'warning');
    return;
  }

  if (this.userType === 'empresa') {

    if (!this.profile.empresa || !this.profile.cargo) {

      await this.showToast(
        'Preencha Empresa e Cargo.',
        'warning'
      );

      return;
    }

  }

  if (this.userType === 'condominio') {

    if (!this.profile.condominio) {

      await this.showToast(
        'Informe o condomínio.',
        'warning'
      );

      return;
    }

  }

  try {

    console.log('Chamando ProfileService...');

    await this.profileService.salvarPerfil(this.profile);

    console.log('Perfil salvo com sucesso!');

    this.showProfileForm = false;

    await this.showToast(
      'Perfil salvo com sucesso!',
      'success'
    );

  } catch (erro) {

    console.error('Erro ao salvar perfil:', erro);

    await this.showToast(
      'Erro ao salvar perfil.',
      'danger'
    );

  }

  console.log('===== FIM salvarPerfil =====');

}
/**
 * Redireciona para a página
 * responsável pela abertura
 * de uma nova Ordem de Serviço.
 */
abrirNovaOrdem() {
  this.router.navigateByUrl('/ordem-servico');   // ← Sem o "-page"
}
/**
 * Encerra a sessão do usuário
 * removendo a autenticação
 * e retornando para a tela de Login.
 */
async logout() {

    await this.loginService.logout();

    this.router.navigateByUrl(
      '/login',
      { replaceUrl: true }
    );

  }
/**
 * Exibe uma mensagem temporária
 * na parte superior da tela.
 *
 * Utilizado para informar:
 *
 * ✔ sucesso
 * ✔ erro
 * ✔ avisos
 */

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

}
