import {AbstractControl, ValidatorFn} from '@angular/forms';
import {Paymentmethods} from '../../models/payment/PaymentChannel';

export class InsuranceValidator {
    static available(allInsurance: { [key: string]: Paymentmethods }): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            if (c.value && !this.valueAvailable(allInsurance, c.value)) {
                return {'insuranceError': true};
            }
            return null;
        };
    }


    private static valueAvailable(allInsurance: { [key: string]: Paymentmethods }, input: string): boolean {
        // const fData = allInsurance.filter(value => value.name.toLowerCase() === input.toLowerCase());
        let found = false;
        Object.keys(allInsurance).forEach(key => {
            if (allInsurance[key].name.toLowerCase() === input.toLowerCase()) {
                found = true;
            }
        });
        return found;
    }
}
