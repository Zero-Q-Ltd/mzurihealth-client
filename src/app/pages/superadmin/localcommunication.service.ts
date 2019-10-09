import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {RawProcedure} from '../../models/procedure/RawProcedure';
import {CustomProcedure} from '../../models/procedure/CustomProcedure';
import {emptyadmin, HospitalAdmin} from '../../models/user/HospitalAdmin';

@Injectable({
    providedIn: 'root'
})
export class LocalcommunicationService {
    onprocedureselected: BehaviorSubject<{
        selectiontype: 'newprocedure' | 'customProcedure' | null,
        selection: { rawprocedure: RawProcedure, customprocedure: CustomProcedure }
    }> = new BehaviorSubject({selectiontype: null, selection: null});
    onadminselected: BehaviorSubject<HospitalAdmin> = new BehaviorSubject<HospitalAdmin>({...emptyadmin});
    ontabchanged = new BehaviorSubject<number>(0);

    constructor() {

    }

    resetall(): void {
        this.onprocedureselected.next({selectiontype: null, selection: null});
    }

    resetselection(): void {
        this.onprocedureselected.value.selection.customprocedure.regularPrice = 0;
        this.onprocedureselected.value.selection.customprocedure.insurancePrices = {};
        this.onprocedureselected.value.selection.customprocedure.customInsurancePrice = false;
        this.onprocedureselected.next({
            selectiontype: this.onprocedureselected.value.selectiontype, selection: {
                rawprocedure: this.onprocedureselected.value.selection.rawprocedure,
                customprocedure: this.onprocedureselected.value.selection.customprocedure
            }
        });
    }
}
