import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {MergedPatientQueueModel} from '../../models/visit/MergedPatientQueueModel';
import {HospitalService} from './hospital.service';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class PaymentHistoryService {
    activehospitalid: string;
    paymentshistory: BehaviorSubject<Array<MergedPatientQueueModel>> = new BehaviorSubject([]);

    constructor(private hospitalservice: HospitalService) {
        this.hospitalservice.activehospital.subscribe(hospital => {
            if (hospital._id) {
                this.activehospitalid = hospital._id;
                this.gethistory('day');
            }
        });
    }

    /**
     *fetches patientvisit and merges it with hospital file info and patient info
     */
    gethistory(timeframe: 'day' | 'week' | 'month' | 'year'): void {
        //     this.paymentshistory.next([]);
        //     this.db.firestore.collection('hospitalvisits')
        //         .where('hospitalId', '==', this.activehospitalid)
        //         .where('checkin.status', '==', 4)
        //         .where('metadata.date', '>=', this.timeframetodate(timeframe))
        //         .get().then(async value => {
        //         Promise.all(value.docs.map(async docdata => {
        //             const visit: PatientVisit = Object.assign({...emptypatientvisit}, docdata.data(), {id: docdata.id});
        //             return this.db.firestore.collection('patients').doc(visit.patientId).get().then(async value1 => {
        //                 const patient: Patient = Object.assign({...emptypatient}, value1.data(), {_id: value1.id});
        //                 const filedata = await this.db.firestore.collection('hospitals').doc(this.activehospitalid)
        //                     .collection('filenumbers')
        //                     .doc(patient._id)
        //                     .get();
        //                 const file: HospFile = Object.assign({...emptyfile}, filedata.data(), {id: filedata.id});
        //                 patient.fileInfo = file;
        //                 return {queuedata: visit, patientdata: patient};
        //             });
        //
        //         })).then(res => {
        //             this.paymentshistory.next(res);
        //         });
        //     });
    }

    private timeframetodate(timeframe: 'day' | 'week' | 'month' | 'year'): Date {
        switch (timeframe) {
            case 'day' :
                return moment().startOf('day').toDate();
            case 'week' :
                return moment().startOf('week').toDate();
            case 'month':
                return moment().startOf('month').toDate();
            default :
                return moment().startOf('year').toDate();
        }
    }

}
