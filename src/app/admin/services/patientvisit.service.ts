import {Injectable} from '@angular/core';
import {QueueService} from './queue.service';
import {HospitalService} from './hospital.service';
import {emptypatientvisit, PatientVisit} from '../../models/visit/PatientVisit';
import {BehaviorSubject} from 'rxjs';
import {Procedureperformed} from '../../models/procedure/Procedureperformed';
import {MergedProcedureModel} from '../../models/procedure/MergedProcedure.model';
import {AdminService} from './admin.service';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class PatientvisitService {
    patientid: string;
    hospitalid: string;
    visithistory: BehaviorSubject<Array<PatientVisit>> = new BehaviorSubject<Array<PatientVisit>>([]);
    currentvisit: BehaviorSubject<PatientVisit> = new BehaviorSubject<PatientVisit>({...emptypatientvisit});
    adminid: string;

    constructor(private queue: QueueService,
                private adminservice: AdminService,
                private hospitalService: HospitalService) {
        /*** DANGEROUS TERRITORY ****
         * the order of calling these functions is very important,
         * because if hospitalId is missing some queries that execute later might fail
         */
        this.adminservice.observableuserdata.subscribe(admin => {
            this.adminid = admin._id;
        });
        hospitalService.activehospital.subscribe(value => {
            this.hospitalid = value._id;
        });
        queue.currentpatient.subscribe(value => {
            if (value.patientdata._id) {
                this.patientid = value.patientdata._id;
                this.fetchvisithistory();
            }
        });

    }


    /**
     * @deprecated : use addprocedures() instead, clean the data before passing to function
     * @param visitid
     * @param procedure
     * @param per
     */
    addprocedure(visitid: string, procedure: MergedProcedureModel, per: Procedureperformed) {
        per.name = procedure.rawProcedure.name;
        per.category = procedure.rawProcedure.category;
        per.metadata = {
            lastEdit: moment().toDate(),
            date: moment().toDate()
        };
        per.adminid = this.adminid;
        per.payment = {
            amount: 0,
            hasInsurance: false,
            methods: []
        };
        per.originalProcedureId = procedure.rawProcedure.id;
        per.customProcedureId = procedure.customProcedure.id;
        // return this.db.collection('hospitalvisits').doc(visitid).update({
        //     procedures: firestore.FieldValue.arrayUnion(per)
        // });
        return true as any;

    }

    /**
     * @param visitid
     * @param procedure
     * @param per
     */
    addprocedures(visitid: string, procedures: Array<Procedureperformed>) {
        // return this.db.collection('hospitalvisits').doc(visitid).update({
        //     procedures: firestore.FieldValue.arrayUnion(...procedures)
        // });
    }

    updateprocedures(visitid: string, procedures: Array<Procedureperformed>) {
        // return this.db.collection('hospitalvisits').doc(visitid).update({
        //     procedures: procedures
        // });
    }

    fetchvisithistory(): void {
        // this.db.firestore.collection('hospitalvisits')
        //     .where('hospitalId', '==', this.hospitalId)
        //     .where('patientId', '==', this.patientId)
        //     .orderBy('metadata.date', 'asc')
        //     .limit(10)
        //     .onSnapshot(snapshot => {
        //         this.visithistory.next(snapshot.docs.map(value => {
        //             const visit = Object.assign({...emptypatientvisit}, value.data(), {id: value.id});
        //             if (!visit.payment.status) {
        //                 this.currentvisit.next(visit);
        //             }
        //             return visit;
        //         }));
        //     });
    }

    editpatientvisit(visit: PatientVisit) {
        // return this.db.collection('hospitalvisits').doc(visit.id).update(visit);
    }

    awaitpayment(visitid) {
        // return this.db.collection('hospitalvisits').doc(visitid).update({
        //     checkin: {
        //         status: 3,
        //         admin: null,
        //     }
        // });
        return true as any;

    }

    payandexit(visit: PatientVisit) {
        visit.checkin = {
            status: 4,
            admin: null,
        };
        visit.payment.status = true;
        // return this.db.collection('hospitalvisits').doc(visit.id).update(visit);
    }

    setprescription(visitid: string, prescription: string) {
        // return this.db.collection('hospitalvisits').doc(visitid).update({
        //     prescription: prescription
        // });
        return true as any;

    }

    terminatepatientvisit(visitid) {
        // return this.db.collection('hospitalvisits').doc(visitid).update({
        //     checkin: {
        //         status: 4,
        //         admin: null,
        //     }
        // });
    }


}
