import {TestBed} from '@angular/core/testing';

import {LocalcommunicationService} from './localcommunication.service';

describe('LocalcommunicationService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: LocalcommunicationService = TestBed.get(LocalcommunicationService);
        expect(service).toBeTruthy();
    });
});
