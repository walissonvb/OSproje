import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonButton, IonIcon, IonCardHeader, IonCardTitle, IonItem, IonCardContent, IonCard, IonList, IonLabel, IonInput } from '@ionic/angular/standalone';
import {Profile} from '../interfaces/profile';
import { Os } from '../interfaces/os';
import { OsService } from '../os';
import { inject } from '@angular/core';

@Component({
  selector: 'app-report-page',
  templateUrl: './report-page.page.html',
  styleUrls: ['./report-page.page.scss'],
  standalone: true,
  imports: [IonInput,IonContent, IonLabel, IonList, IonCard, IonCardContent, IonItem, IonCardTitle, IonCardHeader, IonIcon, IonButton, IonButtons, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ReportPagePage implements OnInit {
  profile: Profile = {
    uid: '',
    nome:'',
    empresa: '',
    cargo: 'terceiro',
    condominio: '',
    tipoUsuario: 'empresa',
    bloco: '',
    apartamento: '',
    firtUser: true,
  };
    protocoloBusca = '';
    ordemEncontrada: Os | null = null;
      pendentes = 0;
  andamento = 0;
  concluidas = 0;
  ordens: Os[] = [];

      private osService = inject(OsService);





  constructor() { }

  ngOnInit() {
  }
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

logout(){

}

}
