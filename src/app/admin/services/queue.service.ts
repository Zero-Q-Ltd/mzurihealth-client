import { Patient, emptypatient } from './../../models/patient/Patient';
import { Queue } from './../../../../.history/src/app/models/hospital/Queue_20190825230616';
import { Injectable } from '@angular/core';
import { HospitalService } from './hospital.service';
import { AdminService } from './admin.service';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { PatientService } from './patient.service';
import { Visit } from '../../models/visit/Visit';
import { emptymergedQueueModel, MergedPatientQueueModel } from '../../models/visit/MergedPatientQueueModel';
import { ProceduresService } from './procedures.service';
import { MergedProcedureModel } from '../../models/procedure/MergedProcedure.model';
import * as moment from 'moment';
import { StitchService } from './stitch/stitch.service';
import { switchMap, takeUntil } from 'rxjs/operators';

import {
    BSON, RemoteInsertOneResult
} from 'mongodb-stitch-browser-sdk';
import { HospFile } from 'app/models/hospital/file';

@Injectable({
    providedIn: 'root'
})
export class QueueService {
    activehospitalid: BSON.ObjectId;
    mainpatientqueue: BehaviorSubject<Array<Queue>> = new BehaviorSubject([]);
    mypatientqueue: BehaviorSubject<Array<Queue>> = new BehaviorSubject([]);
    currentpatient: BehaviorSubject<MergedPatientQueueModel> = new BehaviorSubject({ ...emptymergedQueueModel });
    adminid: BSON.ObjectId;

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
        this.mainpatientqueue.subscribe(queuedata => {
            /**
             * reset the current patient every time patients data changes, because we are only filtering this data
             */
            // let currentpatientfound = false;
            // this.mypatientqueue.next(queuedata.filter(queue => {
            //     const equality = queue.queue.checkin.admin === this.adminid;
            //     if (equality && queue.queuedata.checkin.status === 2) {
            //         console.log(queue);
            //         this.currentpatient.next(queue);
            //         currentpatientfound = true;
            //     }
            //     /***
            //      * Only reset it when no value has been found, otherwise we know that the value has just changed and is already overwritten
            //      */
            //     if (!currentpatientfound) {
            //         this.currentpatient.next({ ...emptymergedQueueModel });
            //     }
            //     return equality;
            // }));
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
        visit.metadata.lastEdit = moment().toDate();
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

    getinsuanceprice(procedure: MergedProcedureModel): number {
        // if (this.currentpatient.value.queuedata.paymentmethod) {
        //     if (procedure.customProcedure.insurancePrices[this.currentpatient.value.queuedata.paymentmethod]) {
        //
        //     }
        // }
        return 0;
    }
    // async getpatientbyid(patientid: BSON.ObjectId): Promise<Patient> {
    //     const patientfile = this.stitch.db.collection<HospFile>('patientfiles')
    //         .findOne({
    //             hospitalId: this.activehospital._id,
    //             patientId: patientid
    //         });

    //     const patientwatcher = await this.stitch.db.collection<Patient>('patients')
    //         .watch([patientid]);

    //     const t = new Observable(h => {
    //         patientwatcher.onNext(k => h.next(k.fullDocument));
    //     });

    //     const pt = combineLatest([patientfile, t], (file, patient) => {
    //         return Object.assign(emptypatient, patient, { fileInfo: file }) as Patient;
    //     });

    //     return pt.toPromise();

    //     // const mainpatientdata = await this.stitch.db.collection('patients').doc(patientid)
    //     //     .get().toPromise().then(async value => {
    //     //         const patient = Object.assign({...emptypatient}, value.data(), {id: value.id});
    //     //         const patientdata = await this.stitch.db.collection('hospitals')
    //     //             .doc(this.activehospital._id)
    //     //             .collection('filenumbers')
    //     //             .doc(patientid).get()
    //     //             .toPromise()
    //     //             .then(val => {
    //     //                 console.log(val.data());
    //     //                 patient.fileinfo = val.data() as HospFile;
    //     //                 console.log(patient);
    //     //                 return patient;
    //     //             });
    //     //         return patientdata;
    //     //     });
    //     // return mainpatientdata;
    // }

    /**
     * This simply creates  subscription to the hospital queue, from which secondary subscriptions to 
     * patient data and queue info can be made
     */
    getqueue() {
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
                    const t = new Observable<Queue>(h => {
                        queuewatcher.onNext(k => h.next(k.fullDocument));
                    });
                    /**
                     * Fetch the patient data
                     * Magic code
                     */
                    t.pipe(switchMap((queue) => {
                        return combineLatest(...queue.queue.map(qq => {
                            const patientfile = this.stitch.db.collection<HospFile>('patientfiles')
                                .findOne({
                                    _id: qq.fileId
                                });
                            const patient = this.stitch.db.collection<Patient>('patients')
                                .findOne({
                                    _id: qq.patientId
                                });
                            // const visit = this.stitch.db.collection<Visit>('visits')
                            //     .findOne({
                            //         _id: qq.patientId
                            //     });
                            return combineLatest([patientfile, patient], (f, p) => {
                                return Object.assign(emptypatient, patient, { fileInfo: patientfile });
                            });
                        }));
                    }));
                }
            })
            .catch(e => {
            });
    }
    private createq(): Promise<RemoteInsertOneResult> {
        const newq: Queue = {
            _id: new BSON.ObjectId(),
            hospitalId: this.activehospitalid,
            queue: []
        };
        return this.stitch.db.collection<Queue>('queues')
            .insertOne(newq);
    }
    /**
     *fetches patientvisit and merges it with hospital file info and patient info
     */
    private fetchqueue(): void {

        //     this.db.collection('hospitalvisits', ref => ref
        //         .where('hospitalId', '==', this.activehospitalid)
        //         .where('checkin.status', '<', 4))
        //         .snapshotChanges().pipe(
        //         switchMap(f => {
        //             return combineLatest(...f.map(t => {
        //                 if (f.length === 0) {
        //                     return of([]);
        //                 }
        //                 const visit: PatientVisit = Object.assign({...emptypatientvisit}, t.payload.doc.data(), {id: t.payload.doc.id});
        //                 return this.db.collection('patients').doc(visit.patientId).snapshotChanges().pipe(
        //                     switchMap(patientdata => {
        //                         if (!patientdata.payload.exists) {
        //                             // console.log(visit)
        //                             return of({...emptymergedQueueModel});
        //                         }
        //                         const patient: Patient = Object.assign(emptypatient, patientdata.payload.data(), {_id: patientdata.payload.id});
        //                         // console.log(patient)
        //                         return of({patientdata: Object.assign({}, {...emptypatient}, patient), queuedata: visit});
        //                     })
        //                 );
        //             }));
        //         }),
        //         switchMap((val1: Array<MergedPatientQueueModel>) => {
        //             console.log(val1);
        //             return combineLatest(...val1.map(t => {
        //                 if (val1.length === 0 || !t.patientdata._id) {
        //                     return of({...emptymergedQueueModel});
        //                 }
        //                 return this.db.collection('hospitals').doc(this.activehospitalid)
        //                     .collection('filenumbers')
        //                     .doc(t.patientdata._id)
        //                     .snapshotChanges()
        //                     .pipe().map(filedata => {
        //                         const file: HospFile = Object.assign({...emptyfile}, filedata.payload.data(), {id: t.patientdata._id});
        //                         t.patientdata.fileInfo = file;
        //                         return t;
        //                     });
        //
        //             }));
        //
        //         })
        //     ).subscribe(mergedData => {
        //         // console.log(mergedData);
        //         this.mainpatientqueue.next(mergedData);
        //     });
        // }
    }
} 
