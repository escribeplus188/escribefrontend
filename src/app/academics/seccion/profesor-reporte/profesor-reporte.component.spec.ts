import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesorReporteComponent } from './profesor-reporte.component';

describe('ProfesorReporteComponent', () => {
  let component: ProfesorReporteComponent;
  let fixture: ComponentFixture<ProfesorReporteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfesorReporteComponent]
    });
    fixture = TestBed.createComponent(ProfesorReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
