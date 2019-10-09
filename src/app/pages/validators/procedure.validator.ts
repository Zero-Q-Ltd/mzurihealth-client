import {AbstractControl, ValidatorFn} from '@angular/forms';
import {MergedProcedureModel} from '../../models/procedure/MergedProcedure.model';

export class ProcedureValidator {
    static available(allhospitalprocedures: MergedProcedureModel[]): ValidatorFn {
        return (c: AbstractControl): { [key: string]: boolean } | null => {
            if (c.value && !this.valueAvailable(allhospitalprocedures, c.value)) {
                return {'procedureError': true};
            }
            return null;
        };
    }


    private static valueAvailable(allInsurance: MergedProcedureModel[], input: MergedProcedureModel): boolean {
        return allInsurance.includes(input);
    }
}
