import { emptypatient, Patient } from './../../models/patient/Patient';
import { Injectable } from '@angular/core';
import { HospitalService } from './hospital.service';
import { AdminService } from './admin.service';
import { BehaviorSubject, combineLatest, } from 'rxjs';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { PatientService } from './patient.service';
import { emptypatientvisit, Visit, NewVisit } from '../../models/visit/Visit';
import { CurrentPatient, MergedPatientQueueModel } from '../../models/visit/MergedPatientQueueModel';
import { ProceduresService } from './procedures.service';
import * as moment from 'moment';
import { StitchService } from './stitch/stitch.service';
import { skipWhile, distinctUntilKeyChanged, distinctUntilChanged } from 'rxjs/operators';
import { RemoteInsertOneResult, Stream } from 'mongodb-stitch-browser-sdk';
import { HospFile } from 'app/models/hospital/HospFile';
import { emptyqueue, Queue } from 'app/models/hospital/Queue';
import { PaymentChannel } from 'app/models/payment/PaymentChannel';
import * as equal from 'deep-equal';
import { Meta } from 'app/models/universal';
import * as BSON from 'bson'
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';

@Injectable({
    providedIn: 'root'
})
export class QueueService {
    activehospitalid: BSON.ObjectId;
    queue: BehaviorSubject<Queue> = new BehaviorSubject(emptyqueue);
    /**
     * by using a map instead of a normal array we solve the n+1 problem that we would have
     * otherwise encountered when sifting through the data, as there is a lot of fitering to do
     * and for big hospitals the number of patients in the mainqueue at any given time might be big
     */
    mainpatientsqueue: BehaviorSubject<Map<BSON.ObjectId, MergedPatientQueueModel>> = new BehaviorSubject(new Map());
    mypatientqueue: BehaviorSubject<Map<BSON.ObjectId, MergedPatientQueueModel>> = new BehaviorSubject(new Map());
    currentpatient: BehaviorSubject<CurrentPatient> = new BehaviorSubject(null);
    adminid: BSON.ObjectId;
    fetchingpatientdata: BehaviorSubject<boolean> = new BehaviorSubject(false);


    /**
     * This keeps a list of all the subscriptions TO THE DATABASE that have been made by this service
     * It's to be maintined as a standard across all services
     */
    subscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();

    constructor(private hospitalservice: HospitalService,
        private adminservice: AdminService,
        private patientservice: PatientService,
        private procedureservice: ProceduresService,
        private stitch: StitchService) {

        /**
         * Only re-subscribe to hospital queue when the hospital id changes
         * Maybe the admin has been moved to another hospital
         */
        this.hospitalservice.activehospital.pipe(distinctUntilChanged((prev, curr) => equal(prev._id, curr._id))).subscribe(hospital => {
            if (hospital._id) {
                this.activehospitalid = hospital._id;
                this.getqueue();
            }
        });

        /**
         * Only filter if the admin id has changed, ignore every other admin change
         */
        adminservice.observableuserdata.pipe(distinctUntilChanged((prev, curr) => equal(prev._id, curr._id))).subscribe((admin: HospitalAdmin) => {
            if (admin._id) {
                this.adminid = admin._id;
                this.fetchQueuedPatients();
            }
        });

    } ls


    /**
     * From reception to rest of admins or admins to admins
     * @param visit
     * @param adminid
     */
    assignadmin(visit: Visit, adminid: string) {
        visit.checkin = {
            status: 1,
            admin: adminid
        };
        visit.metadata.edited = {
            date: moment().toDate(),
            adminId: adminid,
            hospitalId: this.activehospitalid
        };
        console.log(visit);
        return true as any;

        // return this.db.firestore.collection('hospitalvisits').doc(visit.id).update(visit);
    }

    acceptpatient(visit: Visit) {
        // const batch = this.db.firestore.batch();
        visit.checkin = {
            status: 2,
            admin: this.adminid
        };
        return true as any;
        // batch.update(this.db.firestore.collection('hospitalvisits').doc(visit.id), visit);
        // return batch.commit();
    }


    /**
     * This simply creates  subscription to the hospital queue, from which secondary subscriptions to
     * patient data and queue info can be made
     */
    getqueue() {
        if (this.subscriptions.get('queuewatcher')) {
            this.subscriptions.get('queuewatcher').close();
        }
        this.stitch.db.collection<Queue>('queues')
            .findOne({ hospitalId: this.activehospitalid })
            .then(async q => {
                /**
                 * Create  new queue object in case it doesnt exist for that hospital
                 */
                if (!q) {
                    this.createq().then(() => {
                        this.getqueue();
                    });
                } else {
                    this.queue.next(q);
                    this.subscriptions.set('queuewatcher', await this.stitch.db.collection<Queue>('queues')
                        .watch([q._id]))
                    this.subscriptions.get('queuewatcher').onNext(k => {
                        /**
                         * keep a local copy of the queue
                         */
                        this.queue.next(k.fullDocument);
                    });
                }
            });
    }
    /**
     * Fetch the patient data
     * Magic code
     * Using the fetched queue data, fetch patientdata associated with it
     * Every change in the queue data triggers a new database query..... Maybe this can be optimized???
     * ---------------------@Todo Suggestion maybe just query the changed queue element id's, maybe use a temporary 
     * this can be achieved by comparing the array lenths first to determine the added/removed id, or compare the arrays to get
     * the mutated array pos and fetch just that
     * Then update the whole variable
     */

    fetchQueuedPatients() {
        this.queue.subscribe(qu3 => {
            this.fetchingpatientdata.next(true);
            /**
             * make every entry of the elements in the array create an independent Observable
             * Then, by using combinelatest, a value will only be emmitted when every Observable emits a value
             * There afterwards, whenever any of the observables changes, a new set of values is emitted
             * Although this is not the functionlity we are after... maybe this can be improved???
             * I don't see any side effects at this time anyway
             */
            return combineLatest(...qu3.queue.map(qq => {
                const patientfile = this.stitch.db.collection<HospFile>('patientfiles')
                    .findOne({
                        _id: qq.fileId
                    });
                const patient = this.stitch.db.collection<Patient>('patients')
                    .findOne({
                        _id: qq.patientId
                    });
                return combineLatest([patientfile, patient], (f: HospFile, p: Patient) => {
                    const data: MergedPatientQueueModel = {
                        /**
                         * Please note
                         * The three dots below might cause you sleepless nights
                         * Be veeeery careful when refactoring any of this code
                         */
                        patientdata: Object.assign({}, emptypatient, p, { fileInfo: f }),
                        queuedata: qq
                    };
                    return data;
                });
            })).subscribe((que: Array<MergedPatientQueueModel>) => {
                const patientmap: Map<BSON.ObjectId, MergedPatientQueueModel> = new Map();
                const mypatientsmap: Map<BSON.ObjectId, MergedPatientQueueModel> = new Map();
                /**
                 * Use this opportunity to filter patients in the queue that belong to this admin
                 */
                que.map(q => {
                    patientmap.set(q.patientdata._id, q);
                    const equality = equal(q.queuedata.checkin.admin, this.adminid);

                    if (equality) {
                        mypatientsmap.set(q.patientdata._id, q);
                    }
                    if (equality && q.queuedata.checkin.status === 2) {

                        /**
                         * @TODO Create a ~subscription~ to the patient visit
                         *
                         */
                        // this.currentpatient.next(q);
                        // currentpatientfound = true;
                    }
                });
                this.mainpatientsqueue.next(patientmap);
                this.mypatientqueue.next(mypatientsmap);
                this.fetchingpatientdata.next(false);
            });
        })
    }
    addPatientToQueue(newvist: NewVisit, patient: Patient): Promise<any> {
        const meta: Meta = {
            date: moment().toDate(),
            adminId: this.adminservice.userdata._id,
            hospitalId: this.activehospitalid
        };
        const visitId = new BSON.ObjectId;
        const visitTemp: Visit = {
            visitDescription: newvist.description,
            patientId: patient._id,
            hospitalId: this.activehospitalid,
            metadata: {
                edited: meta
            },
            payment: {
                hasInsurance: newvist.payment.name === 'insurance',
                splitPayment: false,
                status: false,
                total: 0,
                singlePayment: {
                    channelId: newvist.payment._id,
                    amount: 0,
                    methodId: newvist.insurance[newvist.selectedInsurance].id || null,
                    transactionId: null
                }
            },
            _id: visitId,
            checkin: {
                status: 0,
                admin: null
            },
            generalNotes: [],
            invoiceId: this.hospitalservice.activehospital.value.invoiceCount + 1,
            prescription: null,
            procedures: [],
            totalcost: 0
        };

        /**
         * update the patient insurance if changed
         */
        patient.insurance = newvist.insurance;
        patient.metadata.edited = meta;
        /**
         * insert the visit to db
         */
        const i = this.stitch.db.collection('visits')
            .insertOne(visitTemp).catch(e => {
                console.log(e);
            });
        /**
         * potentially update the patient insurance
         */
        const j = this.stitch.db.collection('patients')
            .updateOne({ _id: patient._id }, patient).catch(e => {
                console.log(e);
            });
        /**
         * update the hospital queue
         */
        /**
         * Because of type safety, update the current queue then push it to db
         */
        const tempqueue: Queue = this.queue.value;
        tempqueue.queue.push({
            checkin: {
                admin: this.adminservice.userdata._id,
                status: 0,
            },
            fileId: patient.fileInfo._id,
            patientId: patient._id,
            visitId: visitId
        })
        console.log(tempqueue)
        const k = this.stitch.db.collection('queues')
            .updateOne({ _id: this.queue.value._id }, tempqueue).catch(e => {
                console.log(e);
            });
        return Promise.all([i, j, k]);
    }

    /**
     * Inserts an empty queue to the database
     */
    private createq(): Promise<RemoteInsertOneResult> {
        return this.stitch.db.collection<Queue>('queues')
            /**
             * make sure to assign the correct hospitalID
             */
            .insertOne(Object.assign(emptyqueue, { hospitalId: this.activehospitalid }));
    }

} 
