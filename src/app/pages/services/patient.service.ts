import { Injectable } from '@angular/core';
import { emptypatient, Insurance, NextofKin, Patient } from '../../models/patient/Patient';
import { Hospital } from '../../models/hospital/Hospital';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { HospitalService } from './hospital.service';
import { AdminService } from './admin.service';
import * as moment from 'moment';
import { emptyfile, HospFile } from '../../models/hospital/HospFile';
import { BehaviorSubject, combineLatest, Observable, Subscription, ReplaySubject, Subject } from 'rxjs';
import 'rxjs/add/observable/empty';

import { BSON, Stream } from 'mongodb-stitch-browser-sdk';
import { StitchService } from './stitch/stitch.service';
import { NewPatientForm } from 'app/models/patient/NewPatientForm';
import * as equal from 'deep-equal';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';
@Injectable({
    providedIn: 'root'
})
export class PatientService {

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
        private hospitalservice: HospitalService,
        private adminservice: AdminService,
        private stitch: StitchService) {
    }


    getpatientbyid(patientid: BSON.ObjectId): Promise<Patient> {
        const patientfile = this.stitch.db.collection<HospFile>('patientfiles')
            .findOne({
                hospitalId: this.hospitalservice.activehospital.value._id,
                patientId: patientid
            });

        const patientwatcher = this.stitch.db.collection<Patient>('patients')
            .findOne({ _id: patientid });

        const pt = combineLatest([patientfile, patientwatcher], (file, patient) => {
            return Object.assign({}, { ...emptypatient }, patient, { fileInfo: file }) as Patient;
        });

        return pt.toPromise();
    }

    async watchId(id: BSON.ObjectId): Promise<ReplaySubject<Patient>> {
        const query = {
            _id: id
        };
        const queryid = new BSON.ObjectId();

        const response: ReplaySubject<Patient> = new ReplaySubject(1);
        const collection = this.stitch.db.collection<Patient>('patients');
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

    deletepatient(patientid: string): Promise<void> {
        return true as any;

        // const batch = this.stitch.db.firestore.batch();
        // batch.delete(this.stitch.db.firestore.collection('patients').doc(patientid));
        // batch.delete(this.stitch.db.firestore.collection('hospitals').doc(this.hospitalservice.activehospital.value._id).collection('filenumbers').doc(patientid));
        // return batch.commit();
    }


    /**
     * save patient to db
     * */
    savePatient(data: NewPatientForm): Promise<any> {
        /**
         * create data to insert to the patient collection
         * */
        const transformedNextOfKin: NextofKin = {
            name: data.nextofKin.name.toLowerCase(),
            relationship: data.nextofKin.relationship.toLowerCase(),
            phone: data.nextofKin.phone,
            workplace: data.nextofKin.workplace.toLowerCase()
        };

        /**
         * make sure a value exists
         */
        const tempInsurance: Array<Insurance> = data.insurance ? data.insurance.map((value, index: number) => {
            const i: Insurance = {
                id: value.id,
                insuranceNo: value.insuranceNo
            };
            return i;
        }) : [];

        // todays date
        const todayDate = moment().toDate();

        /**
         * patient document ID
         * **/
        const patientID = new BSON.ObjectID();

        const newmeta = {
            date: moment().toDate(),
            adminId: this.adminservice.userdata._id,
            hospitalId: this.hospitalservice.activehospital.value._id
        };

        const modifiedData: Patient = {
            _id: patientID,
            personalInfo: {
                name: data.personalInfo.name.toLowerCase(),
                address: data.personalInfo.address.toLowerCase(),
                gender: data.personalInfo.gender,
                occupation: data.personalInfo.occupation.toLowerCase(),
                workplace: data.personalInfo.workplace.toLowerCase(),
                phone: data.personalInfo.phone,
                email: data.personalInfo.email.toLowerCase(),
                idno: data.personalInfo.idno,
                dob: moment(data.personalInfo.dob, 'MM/DD/YYYY').toDate(),
                photoURL: null,
            },
            nextofKin: transformedNextOfKin,
            insurance: tempInsurance,
            metadata: {
                created: newmeta,
                edited: newmeta
            },
            customFieelds: null,
            exrainfo: null,
            primaryHosp: null,
            status: true
        };

        /**
         * join objects to create a full document
         * */
        const patientDoc = Object.assign({}, { ...emptypatient }, { ...modifiedData }) as Patient;

        /**
         * hospital file number
         * */
        const hospitalFileNumberTemp: HospFile = {
            _id: new BSON.ObjectID(),
            metadata: {
                created: newmeta,
                edited: newmeta
            },
            lastVisit: todayDate,
            hospitalId: this.hospitalservice.activehospital.value._id,
            no: data.fileNo,
            visitCount: 0,
            patientId: patientID,
        };

        const hospitalFileNumber = Object.assign({}, { ...emptyfile }, hospitalFileNumberTemp);

        /**
         * create a file number associated with that hospital only
         */
        const i = this.stitch.db.collection('patientfiles')
            .insertOne(hospitalFileNumber).catch(e => {
                console.log(e);
            });

        /**
         * create the patient
         */
        const j = this.stitch.db.collection('patients')
            .insertOne(patientDoc).catch(e => {
                console.log(e);
            });

        /**
         * Update the patient count in that hospital
         */
        const k = this.stitch.db.collection('hospitals')
            .updateOne(
                {
                    _id: this.hospitalservice.activehospital.value._id
                },
                {
                    $inc: {
                        patientCount: 1
                    }
                },
                {
                    upsert: true
                });

        return Promise.all([i, j, k]);

    }


    /**
     * get all patients
     * @TODO implement a custom paginator
     * */
    getHospitalPatients(): Observable<Array<Patient>> {
        const patientdata = this.stitch.db.collection<Patient>('patients')
            .find(
                {
                    'metadata.created.hospitalId': this.hospitalservice.activehospital.value._id,
                },
                {
                    limit: 25
                })
            .asArray();
        const patientfiles = this.stitch.db.collection<HospFile>('patientfiles')
            .find(
                {
                    'metadata.created.hospitalId': this.hospitalservice.activehospital.value._id,
                },
                {
                    limit: 25,
                    sort: {
                        'metadata.created.date': 1
                    }
                })
            .asArray();

        return combineLatest<Array<Patient>>([patientfiles, patientdata], (f: Array<HospFile>, p: Array<Patient>) => {
            /**
             * crossmatch every file to its relevant patient by looping
             */
            const patients = p.map(patient => {
                /**
                 * There can only be one file associated with a patient
                 */
                const file = f.find(fi => {
                    return equal(fi.patientId, patient._id);
                });
                patient.fileInfo = file;
                return patient;
            });
            return patients;
        });
    }



    updatePatient(patientData: Patient): Promise<any> {
        return this.stitch.db.collection<Patient>('patients').updateOne({ _id: patientData._id }, patientData);
    }

    searchPatient(field: string, value: string): any {
        return true as any;
    }

    updateVitalsAllegiesConditions(patientID: string, vitals, conditions: Array<any>, allegies: Array<any>): any {
        // get current user
        // const patientsDocRef = this.stitch.db.firestore.collection('patients').doc(patientID);
        //
        // return this.stitch.db.firestore.runTransaction(transaction => {
        //     return transaction.get(patientsDocRef).then(patientDoc => {
        //         if (!patientDoc.exists) {
        //             Promise.reject('No such document');
        //             return;
        //         }
        //
        //         const patientData = Object.assign({}, {...emptypatient}, patientDoc.data()) as Patient;
        //
        //         let tempMeta = null;
        //         if (patientData.medicalInfo.metadata.date === null) {
        //             tempMeta = {
        //                 date: moment().toDate(),
        //                 lastedit: moment().toDate()
        //             };
        //         } else {
        //             tempMeta = {
        //                 date: patientData.medicalInfo.metadata.date,
        //                 lastedit: moment().toDate()
        //             };
        //         }
        //
        //         transaction.update(patientsDocRef, Object.assign({}, patientData, {
        //             medicalinfo: {
        //                 vitals,
        //                 conditions,
        //                 allergies: allegies,
        //                 metadata: tempMeta
        //             }
        //         }));
        //     });
        // });
        return true as any;

    }

    /*
    * will use this to check if the file number is available
    * **/
    getHospitalFileByNumber(fileNumber: string): Promise<HospFile> {
        return this.stitch.db.collection<HospFile>('patientfiles')
            .findOne({
                hospitalId: this.hospitalservice.activehospital.value._id,
                no: fileNumber
            });

    }

    unsubscribeAll(): void {
        this.dbSubscriptions.forEach(value => {
            value.close();
        });
    }
}
