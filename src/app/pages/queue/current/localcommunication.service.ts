import { Injectable } from '@angular/core';
import { MedicalInfo, Vitals } from 'app/models/patient/MedicalInfo';
import { Allegy } from 'app/models/procedure/Allergy.model';
import { Condition } from 'app/models/procedure/MedicalConditions.model';
import { Meta } from 'app/models/universal';
import { CoreService } from 'app/pages/services/core/core.service';
import { MedicalinfoService } from 'app/pages/services/medicalinfo.service';
import { QueueService } from 'app/pages/services/core/queue.service';
import * as BSON from 'bson';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class LocalcommunicationService {
    ontabchanged = new BehaviorSubject<number>(0);
    onactivechildpagechanged = new BehaviorSubject<string>('generaldetails');

    vitals: Vitals;
    allergies: Array<Allegy>;
    conditions: Array<Condition>;

    medInfochhanged = false;

    constructor(private medInfo: MedicalinfoService,
        private core: CoreService,
        private queue: QueueService
    ) {
        // queue.currentpatient.subscribe(patient=>{
        //     this.vitals = patient.
        // })
    }

    resetall(): void {
        // this.onprocedureselected.next({selectiontype: null, selection: null});
    }

    saveMedinfo() {
        if (!this.medInfochhanged) {
            return;
        }
        const meta: Meta = {
            date: moment().toDate(),
            adminId: this.core.userData.id,
            hospitalId: this.core.activeHospital.value._id
        };

        const medinfo: MedicalInfo = {
            _id: new BSON.ObjectId(),
            allergies: this.allergies,
            bloodType: '',
            conditions: this.conditions,
            metadata: {
                created: meta,
                edited: meta
            },
            patientId: this.queue.currentpatient.value.patientdata._id,
            visitId: this.queue.currentpatient.value.visitdata._id,
            vitals: this.vitals
        };
        this.medInfo.updateMedInfo(medinfo);
    }
}
