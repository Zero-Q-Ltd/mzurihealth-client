import {TestBed} from '@angular/core/testing';

import {PatientvisitService} from './patientvisit.service';

describe('PatienthistoryService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: PatientvisitService = TestBed.get(PatientvisitService);
        expect(service).toBeTruthy();
    });
});
