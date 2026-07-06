import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdemServicoPagePage } from './ordem-servico-page.page';

describe('OrdemServicoPagePage', () => {
  let component: OrdemServicoPagePage;
  let fixture: ComponentFixture<OrdemServicoPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdemServicoPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
