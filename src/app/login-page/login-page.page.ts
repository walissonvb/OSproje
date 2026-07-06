import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseService } from 'src/app/firebase';
import { User } from '../interfaces/user';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Router } from '@angular/router';

import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  IonSpinner,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  eye,
  eyeOff,
  logoGoogle
} from 'ionicons/icons';


@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.page.html',
  styleUrls: ['./login-page.page.scss'],
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    IonSpinner
  ]
})
export class LoginPage implements OnInit {

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(FirebaseService);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  user: User = {
    idPrimario: '',
    email: '',
    password: ''
  };
  authForm!: FormGroup;

  isLoginMode = true;

  loading = false;

  showPassword = false;

  constructor() {

    addIcons({
      eye,
      eyeOff,
      logoGoogle
    });

  }

  ngOnInit(): void {

    this.authForm = this.fb.group({

      email: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6)
        ]
      ]

    });

    // Verifica automaticamente se já existe usuário logado
    this.authService.user$.subscribe(user => {

      if (user) {

        this.router.navigateByUrl('/home-page', {
          replaceUrl: true
        });

      }

    });

  }

  get email() {
    return this.authForm.get('email');
  }

  get password() {
    return this.authForm.get('password');
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async onSubmit(): Promise<void> {

    if (this.authForm.invalid) {

      this.authForm.markAllAsTouched();
      return;

    }

    const { email, password } = this.authForm.value;

    const loading = await this.loadingCtrl.create({
      message: this.isLoginMode
        ? 'Entrando...'
        : 'Criando conta...'
    });

    await loading.present();

    try {

      if (this.isLoginMode) {

        await this.authService.login(
          email,
          password
        );

        await this.showToast(
          'Login realizado com sucesso!',
          'success'
        );

      } else {

        await this.authService.register(
          email,
          password
        );

        await this.showToast(
          'Cadastro realizado com sucesso!',
          'success'
        );

      }

await this.authService.login(email, password);

this.router.navigateByUrl('/home-page', {
  replaceUrl: true
});

    } catch (error: any) {

      let mensagem = 'Ocorreu um erro inesperado.';

      switch (error.code) {

        case 'auth/user-not-found':
          mensagem = 'Usuário não encontrado.';
          break;

        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          mensagem = 'E-mail ou senha inválidos.';
          break;

        case 'auth/email-already-in-use':
          mensagem = 'Este e-mail já está cadastrado.';
          break;

        case 'auth/invalid-email':
          mensagem = 'E-mail inválido.';
          break;

        case 'auth/weak-password':
          mensagem = 'A senha deve possuir no mínimo 6 caracteres.';
          break;

        case 'auth/network-request-failed':
          mensagem = 'Sem conexão com a internet.';
          break;

      }

      await this.showToast(
        mensagem,
        'danger'
      );

    } finally {

      await loading.dismiss();

    }

  }

  async loginGoogle(): Promise<void> {

    const loading = await this.loadingCtrl.create({
      message: 'Autenticando com Google...'
    });

    await loading.present();

    try {

      await this.authService.loginGoogle();

      await this.showToast(
        'Login com Google realizado!',
        'success'
      );

this.router.navigateByUrl('/home-page', {
  replaceUrl: true
});

    } catch {

      await this.showToast(
        'Falha ao autenticar com Google.',
        'danger'
      );

    } finally {

      await loading.dismiss();

    }

  }

  async resetPassword(): Promise<void> {

    const email = this.email?.value;

    if (!email) {

      await this.showToast(
        'Informe seu e-mail primeiro.',
        'warning'
      );

      return;

    }

    try {

      await this.authService.resetPassword(email);

      await this.showToast(
        'E-mail de recuperação enviado.',
        'success'
      );

    } catch {

      await this.showToast(
        'Não foi possível enviar o e-mail.',
        'danger'
      );

    }

  }

  async showToast(
    message: string,
    color: string
  ): Promise<void> {

    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });

    await toast.present();

  }

}
