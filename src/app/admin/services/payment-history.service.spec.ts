import {TestBed} from '@angular/core/testing';

import {PaymentHistoryService} from './payment-history.service';

describe('PaymentHistoryService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: PaymentHistoryService = TestBed.get(PaymentHistoryService);
        expect(service).toBeTruthy();
    });
});
