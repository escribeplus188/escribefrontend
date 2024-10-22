import { TestBed } from '@angular/core/testing';

import { ProfesorReporteService } from './profesor-reporte.service';

describe('ProfesorReporteService', () => {
  let service: ProfesorReporteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProfesorReporteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
