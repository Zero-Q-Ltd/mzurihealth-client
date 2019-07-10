import {PaymentmethodPipe} from './paymentmethod.pipe';

describe('PaymentmethodPipe', () => {
    it('create an instance', () => {
        const pipe = new PaymentmethodPipe();
        expect(pipe).toBeTruthy();
    });
});
