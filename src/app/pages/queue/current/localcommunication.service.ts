import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MedicalinfoService } from 'app/pages/services/medicalinfo.service';
import { Condition } from 'app/models/procedure/MedicalConditions.model';
import { Vitals, MedicalInfo } from 'app/models/patient/MedicalInfo';
import { Allegy } from 'app/models/procedure/Allergy.model';
import * as BSON from 'bson';
import * as moment from 'moment';
import { Meta } from 'app/models/universal';
import { AdminService } from 'app/pages/services/admin.service';
import { HospitalService } from 'app/pages/services/hospital.service';
import { QueueService } from 'app/pages/services/queue.service';
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
        private adminservice: AdminService,
        private hospService: HospitalService,
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
            adminId: this.adminservice.userdata.id,
            hospitalId: this.hospService.activehospital.value._id
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
