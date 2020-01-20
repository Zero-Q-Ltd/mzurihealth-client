import { AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { PatientService } from '../../pages/services/patient.service';
import { of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { CoreService } from 'app/pages/services/core/core.service';


export class FilenumberValidator {
    static validate(patientService: PatientService, core: CoreService): AsyncValidatorFn {
        return (control: AbstractControl) => {
            return timer(500).pipe(switchMap(() => {
                /**
                 * eliminate empty strings and null values
                 */
                if (control.value && control.value !== '') {
                    /**
                     * try and fethc the file, return error if it exists
                     */
                    return patientService.getHospitalFileByNumber(control.value, core.activeHospital.value._id).then(file => {
                        return file ? { fileError: true } : null;
                    });
                } else {
                    return of([null]);
                }
            }));
        };
    }
}
