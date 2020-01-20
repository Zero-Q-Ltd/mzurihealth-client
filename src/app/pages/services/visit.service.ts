import {Injectable} from '@angular/core';
import {Prescription} from 'app/models/visit/Prescription';
import * as BSON from 'bson';
import {Stream} from 'mongodb-stitch-core-sdk';
import {ChangeEvent, RemoteInsertOneResult, RemoteUpdateResult} from 'mongodb-stitch-core-services-mongodb-remote';
import {ReplaySubject, Subscription} from 'rxjs';
import {Procedureperformed} from '../../models/procedure/Procedureperformed';
import {Checkin, CheckinStatus, Visit} from '../../models/visit/Visit';
import {StitchService} from './stitch/stitch.service';

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
        private stitch: StitchService) {

    }


    /**
     * @deprecated : use addprocedures() instead, clean the data before passing to function
     * @param visitid
     * @param procedure
     * @param per
     */
    // addprocedure(visitid: string, procedure: MergedProcedureModel, per: Procedureperformed) {
    //     per.name = procedure.rawProcedure.name;
    //     per.category = procedure.rawProcedure.category;

    //     const meta: Meta = {
    //         date: moment().toDate(),
    //         adminId: this.adminservice.userdata._id,
    //         hospitalId: this.hospitalService.activehospital.value._id
    //     };

    //     per.metadata = {
    //         created: meta,
    //         edited: meta,
    //     };
    //     per.adminid = this.adminservice.userdata._id;
    //     per.payment = {
    //         amount: 0,
    //         hasInsurance: false,
    //         methods: []
    //     };
    //     per.originalProcedureId = procedure.rawProcedure._id;
    //     // per.customProcedureId = procedure.customProcedure._id;
    //     // return this.db.collection('hospitalvisits').doc(visitid).update({
    //     //     procedures: firestore.FieldValue.arrayUnion(per)
    //     // });
    //     const query = {
    //         _id: visitid
    //     };
    //     return this.stitch.db.collection('hospitalvisits')
    //         .updateOne(query, {
    //             $push: { procedures: procedures }
    //         });
    //     return true as any;

    // }
    /**
     * Fetches the latest patient visit ONCE
     * NOT REALTIME
     * @param id
     */
    getLatest(id: BSON.ObjectId): Promise<Visit> {
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
    addProcedure(visitid: BSON.ObjectId, procedures: Procedureperformed): Promise<RemoteUpdateResult> {
        const query = {
            _id: visitid
        };
        return this.stitch.db.collection('hospitalvisits')
            .updateOne(query, {
                $push: {procedures: procedures}
            });
    }

    updateprocedures(visitId: string, procedures: Array<Procedureperformed>): Promise<RemoteUpdateResult> {
        const query = {
            _id: visitId
        };
        return this.stitch.db.collection('hospitalvisits')
            .updateOne(query, {procedures: procedures});
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

    addVisit(visit: Visit): Promise<RemoteInsertOneResult> {
        return this.stitch.db.collection('visits')
            .insertOne(visit);
    }


    awaitPayment(visitId: BSON.ObjectId, adminId: string): Promise<RemoteUpdateResult> {
        return this.updateVisitStatus(visitId, CheckinStatus['waiting for payment'], adminId);
    }


    setprescription(visitId: BSON.ObjectId, prescription: Prescription): Promise<RemoteUpdateResult> {
        const query = {
            _id: visitId
        };
        return this.stitch.db.collection('hospitalvisits')
            .updateOne(query, {prescription});

    }

    /**
     * Updataes a visit status to completed
     * @param visitId
     */
    payandexit(visitId: BSON.ObjectId, adminId: string): Promise<RemoteUpdateResult> {
        return this.updateVisitStatus(visitId, CheckinStatus.completed, adminId, true);
    }

    /**
     * Updates a visit status to have the currently logged in admin as the one attending to the patient
     * @param visitId The visit to accept
     */
    acceptPatient(visitId: BSON.ObjectId, adminId: string): Promise<RemoteUpdateResult> {
        return this.updateVisitStatus(visitId, CheckinStatus['being attended'], adminId);
    }

    /**
     * Updates the visit status to the specified value and assisn the specified admin
     * @param visitId
     * @param status
     * @param adminId can be null because exited and newly created patients are not assigned to any admins
     * @param paymentStatus
     */
    updateVisitStatus(visitId: BSON.ObjectId, status: CheckinStatus, adminId: string | null, paymentStatus?: boolean): Promise<RemoteUpdateResult> {
        const updatedCheckin: Checkin = {
            status: status,
            admin: adminId,
        };
        /**
         * prevent the possibility of setting payment as true when the visit has not been completed
         */
        if (paymentStatus === true && status !== CheckinStatus.completed) {
            console.error('Cannot set visit as paid when not completed');
            status = CheckinStatus['waiting for payment'];
        }
        return this.stitch.db.collection<Visit>('visits')
            .updateOne({_id: visitId}, {$set: {checkin: updatedCheckin, 'payment.status': paymentStatus || false}});

    }


}
