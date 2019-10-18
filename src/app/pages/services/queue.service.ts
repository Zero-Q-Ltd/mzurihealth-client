import { emptypatient, Patient } from '../../models/patient/Patient';
import { Injectable } from '@angular/core';
import { HospitalService } from './hospital.service';
import { AdminService } from './admin.service';
import { BehaviorSubject, combineLatest, Observable, Subscription, of, Subject, } from 'rxjs';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { PatientService } from './patient.service';
import { Visit, NewVisit } from '../../models/visit/Visit';
import { CurrentPatient, MergedPatientQueueModel } from '../../models/visit/MergedPatientQueueModel';
import * as moment from 'moment';
import { StitchService } from './stitch/stitch.service';
import { distinctUntilChanged, distinctUntilKeyChanged } from 'rxjs/operators';
import { RemoteInsertOneResult, Stream } from 'mongodb-stitch-browser-sdk';
import { HospFile } from 'app/models/hospital/HospFile';
import { emptyqueue, Queue, QueueRef } from 'app/models/hospital/Queue';
import * as equal from 'deep-equal';
import { Meta } from 'app/models/universal';
import * as BSON from 'bson';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';
import { VisitService } from './visit.service';
import { MedicalInfo } from 'app/models/patient/MedicalInfo';
import { MedicalinfoService } from './medicalinfo.service';

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
    currentpatientHistory: BehaviorSubject<Array<Visit>> = new BehaviorSubject<Array<Visit>>([]);

    adminid: BSON.ObjectId;
    fetchingpatientdata: BehaviorSubject<boolean> = new BehaviorSubject(false);
    fetchingCurrentpatientdata: BehaviorSubject<boolean> = new BehaviorSubject(false);


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

    constructor(private hospitalservice: HospitalService,
        private adminservice: AdminService,
        private patientservice: PatientService,
        private visitService: VisitService,
        private medInfoService: MedicalinfoService,
        private stitch: StitchService) {

        /**
         * Only re-subscribe to hospital queue when the hospital id changes
         * Maybe the admin has been moved to another hospital
         */
        this.hospitalservice.activehospital.pipe(distinctUntilChanged((prev, curr) => equal(prev._id, curr._id))).subscribe(hospital => {
            if (hospital._id) {
                this.activehospitalid = hospital._id;
                this.getqueue();
                this.queue.subscribe(qu3 => {
                    this.fetchingpatientdata.next(true);
                    if (this.internalSubscriptions.get('queuesub')) {
                        this.internalSubscriptions.get('queuesub').unsubscribe();
                    }
                    const queuesub = this.fetchQueuedPatients();
                    this.internalSubscriptions.set('queuesub', queuesub);
                });

            }
        });

        /**
         * Only filter if the admin id has changed, ignore every other admin change
         */
        adminservice.observableuserdata.pipe(distinctUntilChanged((prev, curr) => equal(prev._id, curr._id))).subscribe((admin: HospitalAdmin) => {
            if (admin._id) {
                this.adminid = admin._id;
            }
        });

    }


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
    getqueue(): void {
        if (this.dbSubscriptions.get('queuewatcher')) {
            this.dbSubscriptions.get('queuewatcher').close();
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
                    this.dbSubscriptions.set('queuewatcher', await this.stitch.db.collection<Queue>('queues')
                        .watch([q._id]));
                    this.dbSubscriptions.get('queuewatcher').onNext(k => {
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

    fetchQueuedPatients(): Subscription {

        /**
         * make every entry of the elements in the array create an independent Observable
         * Then, by using combinelatest, a value will only be emmitted when every Observable emits a value
         * There afterwards, whenever any of the observables changes, a new set of values is emitted
         * Although this is not the functionlity we are after... maybe this can be improved???
         * I don't see any side effects at this time anyway
         */
        return combineLatest(...this.queue.value.queue.map(qq => {
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
                    patientdata: Object.assign({}, { ...emptypatient }, p, { fileInfo: f }),
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
            que.map(async q => {
                patientmap.set(q.patientdata._id, q);
                const equality = equal(q.queuedata.checkin.admin, this.adminid);

                if (equality) {
                    mypatientsmap.set(q.patientdata._id, q);
                    /**
                       * There's only one source of truth for the queue data
                       * It is obvious that when the current patient changes there must be a refetch of the currentpatient info
                       * for the rest of the objects
                       * make sure that this only happens when the patientID changes
                       * It is safe to make the rest of the objects null since this is the first point of interaction
                       * This MUST work hand in hand with the variable that checks whether fetchingCurrentpatientdata is complete
                       */
                    if (q.queuedata.checkin.status === 2) {
                        console.log('Current Patient Found');
                        this.fetchingCurrentpatientdata.next(true);
                        this.currentpatient.next({
                            medicalInfo: null,
                            patientdata: null,
                            queuedata: q.queuedata,
                            visitdata: null
                        });
                        const t = await this.fetchCurrentpatient();
                        const y = this.fetchCurrentPatientHsistory();
                        return Promise.all([t, y]);
                    } else {
                        /**
                         * possibly remove the patient from current patient in case they left that stage from this Doc
                         *  
                         */
                    }
                }

            });
            this.mainpatientsqueue.next(patientmap);
            this.mypatientqueue.next(mypatientsmap);
            this.fetchingpatientdata.next(false);
        });
    }
    /**
     * Fetches the current Patient details
     */
    async fetchCurrentpatient() {
        console.log('Fetching Current Patient Data');

        const d1 = await this.medInfoService.watchLatest(this.currentpatient.value.queuedata.patientId);
        const d2 = await this.visitService.watchId(this.currentpatient.value.queuedata.visitId);
        const d3 = await this.patientservice.watchId(this.currentpatient.value.queuedata.patientId);

        combineLatest([d1, d2, d3]).subscribe((data) => {
            console.log('Current Patient data fetched');
            console.log(data);
            this.fetchingCurrentpatientdata.next(false);
            this.currentpatient.next({
                medicalInfo: data[0] as any,
                patientdata: data[2] as any,
                queuedata: this.currentpatient.value.queuedata,
                visitdata: data[1] as any
            });
        });

    }
    /**
     * Fetches the current patient 
     */
    fetchCurrentPatientHsistory() {
        console.log('Fetching Current Patient History');
        this.visitService.fetchvisithistory(this.currentpatient.value.queuedata.patientId, 10).then(hist => {
            console.log(hist);
            this.currentpatientHistory.next(hist);
        });
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
        const i = this.visitService.addVisit(visitTemp);
        /**
         * potentially update the patient insurance
         */
        const j = this.patientservice.updatePatient(patient);
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
            visitId: visitId,
            metadata: {
                created: meta,
                edited: meta
            }
        });
        const k = this.updateQueue(tempqueue);
        return Promise.all([i, j, k]);
    }

    updateQueue(queue: Queue): Promise<any> {
        return this.stitch.db.collection('queues')
            .updateOne({ _id: this.queue.value._id }, queue);
    }

    /**
     * Inserts an empty queue to the database
     */
    private createq(): Promise<RemoteInsertOneResult> {
        return this.stitch.db.collection<Queue>('queues')
            /**
             * make sure to assign the correct hospitalID
             */
            .insertOne(Object.assign({}, { ...emptyqueue }, { hospitalId: this.activehospitalid }));
    }

} 
