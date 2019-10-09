import { TestBed } from '@angular/core/testing';

import { MedicalinfoService } from './medicalinfo.service';

describe('MedicalinfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MedicalinfoService = TestBed.get(MedicalinfoService);
    expect(service).toBeTruthy();
  });
});
