import {AbstractControl, ValidatorFn} from '@angular/forms';

export class NumberValidator {
    static validate(): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {

            if (c.value && !this.isNumber(c.value)) {
                return {numberError: true};
            }
            return null;
        };
    }

    private static isNumber(value: string): boolean {
        return !isNaN(+value);
    }

}
