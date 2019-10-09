import {inject, TestBed} from '@angular/core/testing';

import {ProceduresService} from './procedures.service';

describe('ProceduresService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ProceduresService]
        });
    });

    it('should be created', inject([ProceduresService], (service: ProceduresService) => {
        expect(service).toBeTruthy();
    }));
});
