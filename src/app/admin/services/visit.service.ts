import { Injectable } from '@angular/core';
import { QueueService } from './queue.service';
import { HospitalService } from './hospital.service';
import { emptypatientvisit, Visit } from '../../models/visit/Visit';
import { BehaviorSubject, Observable, Subscription, Subject } from 'rxjs';
import { Procedureperformed } from '../../models/procedure/Procedureperformed';
import { MergedProcedureModel } from '../../models/procedure/MergedProcedure.model';
import { AdminService } from './admin.service';
import * as moment from 'moment';
import { Meta } from 'app/models/universal';
import { Prescription } from 'app/models/visit/Prescription';
import { Stream, BSON } from 'mongodb-stitch-core-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';
import { StitchService } from './stitch/stitch.service';
import { Patient } from 'app/models/patient/Patient';

@Injectable({
    providedIn: 'root'
})
export class VisitService {
    patientid: string;
    hospitalid: string;
    visithistory: BehaviorSubject<Array<Visit>> = new BehaviorSubject<Array<Visit>>([]);
    currentvisit: BehaviorSubject<Visit> = new BehaviorSubject<Visit>({ ...emptypatientvisit });
    adminid: string;

    /**
     * This keeps a list of all the DATABASE SUBSCRIPTIONS that have been made by this service
     * It's to be maintined as a standard across all services
     */
    dbSubscriptions: Map<string | BSON.ObjectId, Stream<ChangeEvent<any>>> = new Map();
    /**
     * This keeps a copy of all the internal subscriptions to INTERNAL OBSERVABLES
     * It's to be maintined as a standard across all services
     */
    internalSubscriptions: Map<string, Subscription> = new Map();

    constructor(
        private adminservice: AdminService,
        private hospitalService: HospitalService,
        private stitch: StitchService) {
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
        // this.queue.currentpatient.subscribe(value => {
        //     if (value.patientdata._id) {
        //         this.patientid = value.patientdata._id;
        //         this.fetchvisithistory();
        //     }
        // });

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

        const meta: Meta = {
            date: moment().toDate(),
            adminId: this.adminservice.userdata._id,
            hospitalId: this.hospitalService.activehospital.value._id
        };

        per.metadata = {
            created: meta,
            edited: meta,
        };
        per.adminid = this.adminid;
        per.payment = {
            amount: 0,
            hasInsurance: false,
            methods: []
        };
        per.originalProcedureId = procedure.rawProcedure._id;
        per.customProcedureId = procedure.customProcedure._id;
        // return this.db.collection('hospitalvisits').doc(visitid).update({
        //     procedures: firestore.FieldValue.arrayUnion(per)
        // });
        return true as any;

    }
    async watchId(id: BSON.ObjectId): Promise<Subject<Visit>> {
        const query = {
            _id: id
        };
        const response: Subject<Visit> = new Subject();
        this.dbSubscriptions.set(id, await this.stitch.db.collection<Visit>('visits').watch(query));
        this.stitch.db.collection<Visit>('visits').findOne(query)
            .then(async value => {
                response.next(value);
            })
            .catch(e => response.error(e));

        this.dbSubscriptions.get(id).onNext(data => {
            response.next(data.fullDocument);
        });
        this.dbSubscriptions.get(id).onError(e => {
            response.error(e);
        });
        return response;
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

    addVisit(visit: Visit) {
        this.stitch.db.collection('visits')
            .insertOne(visit)
    }

    editpatientvisit(visit: Visit) {
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

    payandexit(visit: Visit) {
        visit.checkin = {
            status: 4,
            admin: null,
        };
        visit.payment.status = true;
        // return this.db.collection('hospitalvisits').doc(visit.id).update(visit);
    }

    setprescription(visitid: string, prescription: Prescription) {
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
