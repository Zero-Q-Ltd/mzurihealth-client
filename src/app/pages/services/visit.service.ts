import { Injectable } from '@angular/core';
import { QueueService } from './queue.service';
import { HospitalService } from './hospital.service';
import { emptypatientvisit, Visit, Checkin, CheckinStatus } from '../../models/visit/Visit';
import { BehaviorSubject, Observable, Subscription, Subject, ReplaySubject } from 'rxjs';
import { Procedureperformed } from '../../models/procedure/Procedureperformed';
import { MergedProcedureModel } from '../../models/procedure/MergedProcedure.model';
import { AdminService } from './admin.service';
import * as moment from 'moment';
import { Meta } from 'app/models/universal';
import { Prescription } from 'app/models/visit/Prescription';
import { Stream } from 'mongodb-stitch-core-sdk';
import { ChangeEvent, RemoteUpdateResult } from 'mongodb-stitch-core-services-mongodb-remote';
import { StitchService } from './stitch/stitch.service';
import { Patient } from 'app/models/patient/Patient';
import * as BSON from 'bson';

@Injectable({
    providedIn: 'root'
})
export class VisitService {
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
        per.adminid = this.adminservice.userdata._id;
        per.payment = {
            amount: 0,
            hasInsurance: false,
            methods: []
        };
        per.originalProcedureId = procedure.rawProcedure._id;
        // per.customProcedureId = procedure.customProcedure._id;
        // return this.db.collection('hospitalvisits').doc(visitid).update({
        //     procedures: firestore.FieldValue.arrayUnion(per)
        // });
        return true as any;

    }
    /**
     * Fetches the latest patient visit ONCE
     * NOT REALTIME
     * @param id 
     */
    getLatest(id: BSON.ObjectId) {
        const query = {
            _id: id
        };
        const options = {
            sort: {
                'metadata.edited.date': -1
            }
        };
        const collection = this.stitch.db.collection<Visit>('visits');
        return collection.findOne(query, options);

    }
    /**
     * Creates a realtime database subscription
     * @param id 
     */
    async watchId(id: BSON.ObjectId): Promise<ReplaySubject<Visit>> {



        const query = {
            _id: id
        };
        const queryid = new BSON.ObjectId();

        const response: ReplaySubject<Visit> = new ReplaySubject(1);
        const collection = this.stitch.db.collection<Visit>('visits');
        this.dbSubscriptions.set(queryid.toString(), await collection.watch([id]));
        collection.findOne(query)
            .then(async value => {
                response.next(value);
            })
            .catch(e => response.error(e));

        this.dbSubscriptions.get(queryid.toString()).onNext(data => {
            response.next(data.fullDocument);
        });
        this.dbSubscriptions.get(queryid.toString()).onError(e => {
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

    fetchvisithistory(patientId: BSON.ObjectId, limit: number): Promise<Array<Visit>> {
        const query = {
            patientId: patientId
        };
        const options = {
            limit: limit
        };
        return this.stitch.db.collection<Visit>('visits').find(query, options).toArray();
    }

    addVisit(visit: Visit) {
        this.stitch.db.collection('visits')
            .insertOne(visit);
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

    setprescription(visitid: BSON.ObjectId, prescription: Prescription): Promise<RemoteUpdateResult> {
        // return this.db.collection('hospitalvisits').doc(visitid).update({
        //     prescription: prescription
        // });
        return true as any;

    }
    /**
     * Updataes a visit status to completed
     * @param visitId 
     */
    terminatepatientvisit(visitId: BSON.ObjectId): Promise<RemoteUpdateResult> {
        return this.updateVisitStatus(visitId, CheckinStatus.completed, this.adminservice.userdata._id);
    }

    /**
     * Updates a visit status to have the currently logged in admin as the one attending to the patient
     * @param visitId The visit to accept
     */
    acceptPatient(visitId: BSON.ObjectId): Promise<RemoteUpdateResult> {
        return this.updateVisitStatus(visitId, CheckinStatus['being attended'], this.adminservice.userdata._id);
    }

    /**
     * Updates the visit status to the specified value and assisn the specified admin
     * @param visitId 
     * @param status 
     * @param adminId can be null because exited and newly created patients are not assigned to any admins
     */
    updateVisitStatus(visitId: BSON.ObjectId, status: CheckinStatus, adminId: BSON.ObjectId | null): Promise<RemoteUpdateResult> {
        const updatedCheckin: Checkin = {
            status: status,
            admin: adminId,
        };
        return this.stitch.db.collection<Visit>('visits').updateOne({ _id: visitId }, { $set: { checkin: updatedCheckin } });

    }


}
