import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportPagePage } from './report-page.page';

describe('ReportPagePage', () => {
  let component: ReportPagePage;
  let fixture: ComponentFixture<ReportPagePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
