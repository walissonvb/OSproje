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
  LoadingController
} from '@ionic/angular/standalone';

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

  imports: [
    CommonModule,
    FormsModule,

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

    IonSegment,
    IonSegmentButton,

    IonInput,
    IonSelect,
    IonSelectOption
  ]
})
export class HomePage implements OnInit, AfterViewInit {
  private profileService = inject(ProfileService);
  private osService = inject(OsService);
  private auth = inject(Auth);
  private router = inject(Router);
  private toastCtrl = inject(ToastController);
  private loginService = inject(FirebaseService);
  private loadingCtrl = inject(LoadingController);
  private idsAutorizados: string[] = [
    '4o4vOu8BjaVNDpp2c4WYGWsSL9G2',
    'OUTRO_ID_AUTORIZADO',
    // Adicione quantos quiser
  ];

  ordens: Os[] = [];

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

  grafico: Chart | undefined;

  @ViewChild('graficoOS')
  graficoCanvas!: ElementRef<HTMLCanvasElement>;

  constructor() {

    addIcons({
      logOutOutline,
      addCircleOutline
    });

  }

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

ngAfterViewInit(): void {

    setTimeout(() => {
      this.gerarGrafico();
    }, 500);

  }

  onUserTypeChange() {

    this.profile.tipoUsuario = this.userType;

    console.log(this.userType);

  }
reportPage(): void {
  this.router.navigateByUrl('/report-page');
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

          console.log(erro);

          this.showToast(
            'Erro ao carregar ordens.',
            'danger'
          );

        }

      });

  }

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

abrirNovaOrdem() {
  this.router.navigateByUrl('/ordem-servico');   // ← Sem o "-page"
}

  async logout() {

    await this.loginService.logout();

    this.router.navigateByUrl(
      '/login',
      { replaceUrl: true }
    );

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

}
