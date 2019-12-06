import { emptypatient, Patient } from '../../models/patient/Patient';
import { Injectable } from '@angular/core';
import { HospitalService } from './hospital.service';
import { AdminService } from './admin.service';
import { BehaviorSubject, combineLatest, Observable, Subscription, of, Subject, } from 'rxjs';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { PatientService } from './patient.service';
import { Visit, NewVisit, CheckinStatus } from '../../models/visit/Visit';
import { CurrentPatient, MergedPatientQueueModel } from '../../models/visit/MergedPatientQueueModel';
import * as moment from 'moment';
import { StitchService } from './stitch/stitch.service';
import { distinctUntilChanged, distinctUntilKeyChanged, skipWhile, take } from 'rxjs/operators';
import { RemoteInsertOneResult, Stream } from 'mongodb-stitch-browser-sdk';
import { HospFile } from 'app/models/hospital/HospFile';
import { Meta } from 'app/models/universal';
import * as BSON from 'bson';
import { ChangeEvent, OperationType } from 'mongodb-stitch-core-services-mongodb-remote';
import { VisitService } from './visit.service';
import { MedicalInfo, emptymedicalInfo } from 'app/models/patient/MedicalInfo';
import { MedicalinfoService } from './medicalinfo.service';

@Injectable({
    providedIn: 'root'
})
export class QueueService {
    activehospitalid: BSON.ObjectId;
    /**
     * by using a map instead of a normal array we solve the n+1 problem that we would have
     * otherwise encountered when sifting through the data, as there is a lot of fitering to do
     * and for big hospitals the number of patients in the mainqueue at any given time might be big
     */
    mainpatientsqueue: BehaviorSubject<Map<string, MergedPatientQueueModel>> = new BehaviorSubject(new Map());
    mypatientqueue: BehaviorSubject<Map<string, MergedPatientQueueModel>> = new BehaviorSubject(new Map());

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
        this.hospitalservice.activehospital.pipe(
            skipWhile(t => !t._id),
            distinctUntilChanged((prev, curr) => prev._id.toHexString() === curr._id.toHexString()))
            .subscribe(hospital => {
                this.activehospitalid = hospital._id;
                this.fetchQueuedPatients();
            });

        /**
         * Only filter if the admin id has changed, ignore every other admin change
         */
        adminservice.observableuserdata
            .pipe(distinctUntilChanged((prev, curr) => prev._id.toHexString() === curr._id.toHexString()))
            .subscribe((admin: HospitalAdmin) => {
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
    assignadmin(visit: Visit, adminid: BSON.ObjectID) {
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
        return true;

        // return this.db.firestore.collection('hospitalvisits').doc(visit.id).update(visit);
    }


    fetchQueuedPatients(): void {

        if (this.dbSubscriptions.get('patientVisits')) {
            this.dbSubscriptions.get('patientVisits').close();
        }
        this.stitch.db.collection<Visit>('visits')
            .find({
                'checkin.status': {
                    $lte: CheckinStatus['waiting for payment']
                }
            })
            .toArray()
            .then(async activeVisits => {
                // console.log(activeVisits);
                this.combinePatientData(activeVisits);

                const visits = await this.stitch.db.collection<Visit>('visits')
                    .watch();
                visits.onNext(q => {
                    // console.log(q);
                    switch (q.operationType) {
                        case OperationType.Delete: {
                            /**
                             * remove the deleted item from the array by filtering and only returning true if the id matches
                             */
                            activeVisits.filter(t => {
                                return t._id.toHexString() !== q.fullDocument._id.toHexString();
                            });
                            this.combinePatientData(activeVisits);

                            break;
                        }

                        case OperationType.Insert: {
                            /**
                             * Add the visit to the array
                             */
                            activeVisits.push(q.fullDocument);
                            this.combinePatientData(activeVisits);
                            break;
                        }

                        case OperationType.Replace: {
                            /**
                             * Check if the patient has left the queue
                             */
                            if (q.fullDocument.checkin.status === CheckinStatus.completed) {
                                /**
                                * remove the exited item from the array by filtering and only returning true if the id matches
                                */
                                activeVisits.filter(t => {
                                    return t._id.toHexString() !== q.fullDocument._id.toHexString();
                                });
                                this.combinePatientData(activeVisits);
                            } else {
                                /**
                                 * update the changed item, dont trigger a database query
                                 */

                                this.updatePatientVisits(q.fullDocument);
                            }
                            break;
                        }

                        case OperationType.Update: {
                            /**
                            * Check if the patient has left the queue
                            */
                            if (q.fullDocument.checkin.status === CheckinStatus.completed) {
                                /**
                                * remove the exited item from the array by filtering and only returning true if the id matches
                                */
                                activeVisits.filter(t => {
                                    return t._id.toHexString() !== q.fullDocument._id.toHexString();
                                });
                                this.combinePatientData(activeVisits);
                            } else {
                                /**
                                 * update the changed item, dont trigger a database query
                                 */

                                this.updatePatientVisits(q.fullDocument);
                            }
                            break;
                        }

                        default: {
                            console.error('An unknown db operatoin occured');
                            break;
                        }
                    }
                });
            });
    }

    /**
     * This only updates the status of the patient queue
     * This logic is very sensitive and arranged the way it is because of the following reason(s)
     * 1. The patient movement pipeline dictates that a patient is first added to that admin's queue 
     * 2. The admin accepts them (That means they already exist in that admin's queue ^^Above)
     * Hence if you are edisitng the db direct and skip adding the patient to that admin's queue, 
     * the patient WILL NOT appear in the current patient tab even if the stage is correct
     */
    async updatePatientVisits(visit: Visit): Promise<void> {
        const patientmap: Map<string, MergedPatientQueueModel> = this.mainpatientsqueue.value;
        const mypatientsmap: Map<string, MergedPatientQueueModel> = this.mypatientqueue.value;

        const previousData: MergedPatientQueueModel = patientmap.get(visit.patientId.toHexString());
        /**
         * There is a possibility that the patient was not previously in the queue, 
         * so these two vars might contain different values
         */
        const previousDataQueue: MergedPatientQueueModel = mypatientsmap.get(visit.patientId.toHexString());

        /**
         * replace the visit data into the array
         */
        patientmap.set(visit.patientId.toHexString(), { visitData: visit, patientdata: previousData.patientdata });
        /**
         * replace the patientdata if they're in the current admin queue
         */
        if (previousDataQueue) {
            /**
             * remove from my queue in case they have moved away
             */
            if (!this.checkAdmin(visit.checkin.admin)) {
                mypatientsmap.delete(visit.patientId.toHexString());
                /**
                 * also remove from the current patient in case they were being attended
                 */
                if (this.currentpatient.value.visitdata._id.toHexString() === visit._id.toHexString()) {
                    this.currentpatient.next(null);
                }
            } else {
                mypatientsmap.set(visit.patientId.toHexString(), { visitData: visit, patientdata: previousData.patientdata });
                if (visit.checkin.status === CheckinStatus['being attended']) {
                    this.currentpatient.next(await this.fetchCurrentPatientData(visit, previousData.patientdata, true));
                }
            }
        }
        /**
         * Add them to the queue in case they've just been added
         */
        else if (this.checkAdmin(visit.checkin.admin)) {
            mypatientsmap.set(visit.patientId.toHexString(),
                { visitData: visit, patientdata: previousData.patientdata });
        }
        this.mainpatientsqueue.next(patientmap);
        this.mypatientqueue.next(mypatientsmap);
    }

    /**
     * checks whether a checkin is assigned to the current admin
     */
    checkAdmin(checkinAdmin: BSON.ObjectID | null | undefined): boolean {
        if (!checkinAdmin) {
            return false;
        }
        else {
            return checkinAdmin.toHexString() === this.adminid.toHexString();
        }
    }

    /**
     * This fetches the patient file and the patient data and merges.
     * The merged data is then assigned to the respective queue
     * It also triggers fetching of current patient if they are in the user queue
     * @param visits the visits array
     */
    combinePatientData(visits: Visit[]): void {
        /**
         * create a map of the patient ids to be used in file and patient query
         */
        const idMap = visits.map(r => r.patientId);
        const patientFileQuery = {
            patientId: {
                $in: idMap
            }
        };
        const patientQuery = {
            _id: {
                $in: idMap
            }
        };

        const f = this.stitch.db.collection<HospFile>('patientfiles').find(patientFileQuery).toArray();
        const p = this.stitch.db.collection<Patient>('patients').find(patientQuery).toArray();
        combineLatest([f, p])
            /**
             * Take only the first emission because all subsequent db changes will triegger an equivalent evaluation
             */
            .pipe(take(1))
            .subscribe(result => {
                console.log('queued patients data fetched');
                const patientmap: Map<string, MergedPatientQueueModel> = new Map();
                const mypatientsmap: Map<string, MergedPatientQueueModel> = new Map();

                visits.map(async visit => {
                    /**
                     * check if the visit is for the current admin
                     */
                    const matchingPatient: Patient = result[1].filter(pp => pp._id.toHexString() === visit.patientId.toHexString())[0];
                    matchingPatient.fileInfo = result[0].filter(ff => ff.patientId.toHexString() === matchingPatient._id.toHexString())[0];

                    patientmap.set(visit.patientId.toHexString(), { visitData: visit, patientdata: matchingPatient });


                    if (this.checkAdmin(visit.checkin.admin)) {
                        mypatientsmap.set(visit.patientId.toHexString(), { visitData: visit, patientdata: matchingPatient });
                        if (visit.checkin.status === CheckinStatus['being attended']) {
                            this.currentpatient.next(await this.fetchCurrentPatientData(visit, matchingPatient, false));
                        }
                    }
                });
                this.mainpatientsqueue.next(patientmap);
                this.mypatientqueue.next(mypatientsmap);
                this.fetchingpatientdata.next(false);
            });
    }

    /**
     * Uses the patient id to fetch the most recent medicalInfo and conditionally update the patientdata
     * The visit is provided
     * @param visit 
     * @param patientId 
     */
    async fetchCurrentPatientData(visitdata: Visit, patient: Patient, updatePatientdata: boolean): Promise<CurrentPatient> {
        console.log('Current Patient Found');
        this.fetchingCurrentpatientdata.next(true);

        this.fetchCurrentPatientHsistory(visitdata.patientId, 10);

        return {
            /**
             * make sure that a value is assigned to the med info
             */
            medicalInfo: await this.medInfoService.getLatest(patient._id) || { ...emptymedicalInfo },
            patientdata: updatePatientdata ? await this.patientservice.getpatientbyid(patient._id) : patient,
            visitdata
        };
    }

    /**
     * Fetches the current patient 
     */
    fetchCurrentPatientHsistory(patientId: BSON.ObjectID, size: number): void {
        this.visitService.fetchvisithistory(patientId, size).then(hist => {
            console.log('Current Patient history fetched');
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
        return Promise.all([i, j]);
    }

} 
