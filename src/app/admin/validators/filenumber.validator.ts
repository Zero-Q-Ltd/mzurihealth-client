import {AbstractControl, AsyncValidatorFn} from '@angular/forms';
import {PatientService} from '../services/patient.service';
import {map, take} from 'rxjs/operators';
import {of} from 'rxjs';


export class FilenumberValidator {
    static validate(patientService: PatientService): AsyncValidatorFn {
        return (control: AbstractControl) => {
            if (control.value) {
                return patientService.getHospitalFileByNumber(control.value).pipe(
                    take(1),
                    map(d => {
                        console.log(d);
                        return d.length !== 0 ? {fileError: true} : null;
                    })
                );
            } else {
                return of([null]);
            }
        };
    }
}
