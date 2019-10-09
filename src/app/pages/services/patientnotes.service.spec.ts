import {TestBed} from '@angular/core/testing';

import {PatientnotesService} from './patientnotes.service';

describe('PatientnotesService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: PatientnotesService = TestBed.get(PatientnotesService);
        expect(service).toBeTruthy();
    });
});
