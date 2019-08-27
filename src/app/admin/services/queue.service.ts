import { Patient, emptypatient } from './../../models/patient/Patient';
import { Injectable } from '@angular/core';
import { HospitalService } from './hospital.service';
import { AdminService } from './admin.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { PatientService } from './patient.service';
import { Visit, emptypatientvisit } from '../../models/visit/Visit';
import { emptymergedQueueModel, MergedPatientQueueModel as PatientQueue, CurrentPatient } from '../../models/visit/MergedPatientQueueModel';
import { ProceduresService } from './procedures.service';
import { MergedProcedureModel } from '../../models/procedure/MergedProcedure.model';
import * as moment from 'moment';
import { StitchService } from './stitch/stitch.service';
import { switchMap, takeUntil, skipWhile } from 'rxjs/operators';
import { RemoteInsertOneResult } from 'mongodb-stitch-browser-sdk';
import { HospFile } from 'app/models/hospital/HospFile';
import { Queue, emptyqueue } from 'app/models/hospital/Queue';
import { PaymentChannel } from 'app/models/payment/PaymentChannel';

import {
    BSON
} from 'mongodb-stitch-browser-sdk';
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
    mainpatientsqueue: BehaviorSubject<Map<BSON.ObjectId, PatientQueue>> = new BehaviorSubject(new Map());
    mypatients: BehaviorSubject<Map<BSON.ObjectId, PatientQueue>> = new BehaviorSubject(new Map());
    mypatientqueue: BehaviorSubject<Array<PatientQueue>> = new BehaviorSubject([]);
    currentpatient: BehaviorSubject<CurrentPatient> = new BehaviorSubject(null);
    adminid: BSON.ObjectId;
    fetchingpatientdata: BehaviorSubject<boolean> = new BehaviorSubject(false);

    constructor(private hospitalservice: HospitalService,
        private adminservice: AdminService,
        private patientservice: PatientService,
        private procedureservice: ProceduresService,
        private stitch: StitchService) {
        this.hospitalservice.activehospital.subscribe(hospital => {
            if (hospital._id) {
                this.activehospitalid = hospital._id;
                this.getqueue();
            }
        });

        adminservice.observableuserdata.subscribe((admin: HospitalAdmin) => {
            if (admin._id) {
                this.adminid = admin._id;
                this.filterqueue();
            }
        });

    }

    /**
     * filters the queue to find the doc's queue as well as his current patient
     */
    filterqueue(): void {

        combineLatest([this.queue, this.mainpatientsqueue])
            /**
            * Only filter the data if its not already loading, because the queue may change and trigger,
            * but we want to filter once loading is complete
            */
            .pipe(skipWhile(() => this.fetchingpatientdata.value))
            .subscribe(data => {
                const qq = data[0].queue;
                const pp = data[1];
                /**
                 * filter through the array to find queue-data that belong to this admin
                 */
                const mypatients = qq.filter(queue => {
                    const equality = queue.checkin.admin === this.adminid;

                    if (equality && queue.checkin.status === 2) {
                        console.log(queue);
                        /**
                         * get the patient from the array
                         */
                        const dd = pp.get(queue.patientId);
                        /**
                         * @TODO Create a ~subscription~ to the patient visit
                         * 
                         */
                        // this.currentpatient.next();
                        // currentpatientfound = true;
                    }
                    return equality;
                }).map(q => {
                    return this.mainpatientsqueue.value.get(q.patientId);
                });
                const mypatientsmap: Map<BSON.ObjectId, PatientQueue> = new Map();
                mypatients.map(q => {
                    mypatientsmap.set(q.patientdata._id, q);
                });
                this.mypatients.next(mypatientsmap);
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
    getqueue() {
        console.log('triggered');
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
                    const queuewatcher = await this.stitch.db.collection<Queue>('queues')
                        .watch([q._id]);
                    queuewatcher.onNext(k => {

                        /**
                         * Fetch the patient data
                         * Magic code
                         * Using the fetched queue data, fetch patientdata associated with it
                         * Every change in the queue data triggers a new database query..... Maybe this can be optimized???
                         * ---------------------@Todo Suggestion maybe just query the changed queue element id's
                         * this can be achieved by comparing the array lenths first to determine the added/removed id, or compare the arrays to get
                         * the mutated array pos and fetch just that 
                         * Then update the whole variable
                         */

                        /**
                         * keep a local copy of the queue
                         */
                        this.queue.next(k.fullDocument);

                        this.fetchingpatientdata.next(true);
                        /**
                         * make every entry of the elements in the array create an independent Observable
                         * Then, by using combinelatest, a value will only be emmitted when every Observable emits a value
                         * There afterwards, whenever any of the observables changes, a new set of values is emitted
                         * Although this is not the functionlity we are after... maybe this can be improved???
                         * I don't see any side effects at this time anyway
                         */
                        return combineLatest(...k.fullDocument.queue.map(qq => {
                            const patientfile = this.stitch.db.collection<HospFile>('patientfiles')
                                .findOne({
                                    _id: qq.fileId
                                });
                            const patient = this.stitch.db.collection<Patient>('patients')
                                .findOne({
                                    _id: qq.patientId
                                });
                            return combineLatest([patientfile, patient], (f: HospFile, p: Patient) => {
                                const data: PatientQueue = {
                                    patientdata: Object.assign(emptypatient, p, { fileInfo: f }),
                                    queuedata: qq
                                };
                                return data;
                            });
                        })).subscribe(que => {
                            this.fetchingpatientdata.next(true);
                            const patientmap: Map<BSON.ObjectId, PatientQueue> = new Map();
                            que.map(q => {
                                patientmap.set(q._id, q);
                            });
                            this.mainpatientsqueue.next(patientmap);
                        });
                    });
                }
            });
    }

    addPatientToQueue({ type, description, insurance }: {
            type: PaymentChannel,
            description: string,
            insurance: Array<{
                insuranceControl: string;
                insurancenumber: string;
            }>
        },
        patient: Patient,
        selected:
            {
                insuranceControl: string,
                insurancenumber: string
            }): Promise<void> {

        /**
         * steps
         * 1. hospitalvisits
         * 2. filenumber last visit -- maybe when everything is done
         * 3.
         * */

        const visitTemp: Visit = {
            visitDescription: description,
            patientId: patient._id,
            hospitalId: this.activehospitalid,
            metadata: {
                edited: {
                    date: moment().toDate(),
                    adminId: this.adminservice.userdata._id,
                    hospitalId: this.activehospitalid
                }
            },
            payment: {
                hasInsurance: type.name === 'insurance',
                splitPayment: false,
                status: false,
                total: 0,
                singlePayment: {
                    channelId: type._id,
                    amount: 0,
                    methodId: type.name === 'insurance' ? selected.insuranceControl : null,
                    transactionId: null
                }

            },
            _id: new BSON.ObjectId,
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

        const combineData = Object.assign({}, emptypatientvisit, visitTemp);
        //
        // // Get a new write batch
        // const batch = this.stitch.db.firestore.batch();
        // const hospitalVisitRef = this.stitch.db.firestore.collection('hospitalvisits').doc(queueID);
        // batch.set(hospitalVisitRef, combineData);
        //
        //
        // // const
        // // store insurance
        // const tempInsurance = insurance.map((value, index: number) => {
        //     return {id: value.insuranceControl, insuranceno: value.insurancenumber};
        // });
        //
        // const patientRef = this.stitch.db.firestore
        //     .collection('patients').doc(patient._id);
        //
        // batch.update(patientRef, {patient, insurance: tempInsurance});
        //
        // // TODO: use transactions with promise.all
        // // increment the visit count
        // const hospitalFileRef = this.stitch.db.firestore.collection('hospitals')
        //     .doc(this.activehospital._id).collection('filenumbers').doc(patient._id);
        //
        //
        // batch.update(hospitalFileRef, Object.assign({}, patient.fileInfo, {visitcount: patient.fileInfo.visitCount + 1}));
        //
        // return batch.commit();
        return true as any;

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
