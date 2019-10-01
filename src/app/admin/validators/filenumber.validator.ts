import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { PatientService } from '../services/patient.service';
import { of, Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';


export class FilenumberValidator {
    static validate(patientService: PatientService): AsyncValidatorFn {
        return (control: AbstractControl) => {
            return timer(500).pipe(switchMap(() => {
                /**
                 * eliminate empty strings and null values
                 */
                if (control.value && control.value !== '') {
                    /**
                     * try and fethc the file, return error if it exists
                     */
                    return patientService.getHospitalFileByNumber(control.value).then(file => {
                        return file ? { fileError: true } : null;
                    });
                } else {
                    return of([null]);
                }
            }));
        };
    }
}
