import {TestBed} from '@angular/core/testing';

import {GenericQueryService} from './generic-query.service';

describe('GenericQueryService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: GenericQueryService = TestBed.get(GenericQueryService);
        expect(service).toBeTruthy();
    });
});
