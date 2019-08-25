import { MergedPatientQueueModel } from './../../models/visit/MergedPatientQueueModel';
import { Injectable } from '@angular/core';
import { emptypatient, Patient } from '../../models/patient/Patient';
import { emptypatientvisit } from '../../models/visit/Visit';
import { Hospital } from '../../models/hospital/Hospital';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { HospitalService } from './hospital.service';
import { AdminService } from './admin.service';
import * as moment from 'moment';
import { emptyfile, HospFile } from '../../models/hospital/file';
import { AddPatientFormModel } from '../../models/patient/AddPatientForm.model';
import { debounceTime, map, switchMap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, Observable, of, from } from 'rxjs';
import 'rxjs/add/observable/empty';
import { PaymentChannel } from '../../models/payment/PaymentChannel';

import {
    BSON
} from 'mongodb-stitch-browser-sdk';
import { StitchService } from './stitch/stitch.service';

@Injectable({
    providedIn: 'root'
})
export class PatientService {

    activehospital: Hospital;
    userdata: HospitalAdmin;
    hospitalpatients: BehaviorSubject<Array<Patient>> = new BehaviorSubject([]);

    constructor(
        private hospitalservice: HospitalService,
        private adminservice: AdminService,
        private stitch: StitchService) {
        this.hospitalservice.activehospital.subscribe(hospital => {
            if (hospital._id) {
                this.activehospital = hospital;
                /**
                 * call the get hospital patients and invoke hospitalpatients
                 * **/
                this.getHospitalPatients();
                // this.getpatientbyid(new BSON.ObjectID('5d61e1d1d6bfc02218d2e131')).then(k => {
                //     console.log(k)
                // });
            }
        });
        adminservice.observableuserdata.subscribe((admin: HospitalAdmin) => {
            if (admin.data.uid) {
                this.userdata = admin;
            }
        });

    }


    getpatientbyid(patientid: BSON.ObjectId): Promise<Patient> {
        const patientfile = this.stitch.db.collection<HospFile>('patientfiles')
            .findOne({
                hospitalId: this.activehospital._id,
                patientId: patientid
            });

        const patientwatcher = this.stitch.db.collection<Patient>('patients')
            .findOne({ _id: patientid});

        const pt = combineLatest([patientfile, patientwatcher], (file, patient) => {
            return Object.assign(emptypatient, patient, { fileInfo: file }) as Patient;
        });

        return pt.toPromise();

        // const mainpatientdata = await this.stitch.db.collection('patients').doc(patientid)
        //     .get().toPromise().then(async value => {
        //         const patient = Object.assign({...emptypatient}, value.data(), {id: value.id});
        //         const patientdata = await this.stitch.db.collection('hospitals')
        //             .doc(this.activehospital._id)
        //             .collection('filenumbers')
        //             .doc(patientid).get()
        //             .toPromise()
        //             .then(val => {
        //                 console.log(val.data());
        //                 patient.fileinfo = val.data() as HospFile;
        //                 console.log(patient);
        //                 return patient;
        //             });
        //         return patientdata;
        //     });
        // return mainpatientdata;
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

    deletepatient(patientid: string): Promise<void> {
        return true as any;

        // const batch = this.stitch.db.firestore.batch();
        // batch.delete(this.stitch.db.firestore.collection('patients').doc(patientid));
        // batch.delete(this.stitch.db.firestore.collection('hospitals').doc(this.activehospital._id).collection('filenumbers').doc(patientid));
        // return batch.commit();
    }


    /**
     * save patient to db
     * */
    savePatient({ personaLinfo, insurance, nextofkin }: AddPatientFormModel): Promise<any> {
        /**
         * create data to insert to the patient collection
         * */
        const transformedNextOfKin = {
            name: nextofkin.name.toLowerCase(),
            relationship: nextofkin.relationship.toLowerCase(),
            phone: nextofkin.phone,
            workplace: nextofkin.workplace.toLowerCase()
        };

        const tempInsurance = insurance.map((value, index: number) => {
            return { id: value._id, insuranceno: value.insuranceNo };
        });

        // todays date
        const todayDate = moment().toDate();

        /**
         * patient document ID
         * **/
        const patientID = new BSON.ObjectID();


        const modifiedData = {
            id: patientID,
            personalinfo: {
                name: personaLinfo.firstName.toLowerCase() + ' ' + personaLinfo.lastName.toLowerCase(),
                address: personaLinfo.address.toLowerCase(),
                gender: personaLinfo.gender,
                occupation: personaLinfo.occupation.toLowerCase(),
                workplace: personaLinfo.workplace.toLowerCase(),
                phone: personaLinfo.phone,
                email: personaLinfo.email.toLowerCase(),
                idno: personaLinfo.idNo,
                dob: moment(personaLinfo.birth, 'MM/DD/YYYY').toDate(),
            },
            nextofkin: transformedNextOfKin,
            insurance: tempInsurance,
            metadata: {
                date: todayDate,
                lastedit: todayDate
            }
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
            date: todayDate,
            lastVisit: todayDate,
            hospitalId: this.activehospital._id,
            no: personaLinfo.fileno,
            visitCount: 0,
            patientId: patientID,
            idno: personaLinfo.idNo
        };

        const hospitalFileNumber = Object.assign({}, emptyfile, hospitalFileNumberTemp);

        const i = this.stitch.db.collection<HospFile>('patientfiles')
            .insertOne(hospitalFileNumber)

        const j = this.stitch.db.collection<Patient>('patients')
            .insertOne(patientDoc);

        const k = this.stitch.db.collection('hospitals')
            .updateOne({ _id: this.activehospital._id }, { $set: { $inc: { patientcount: 1 } } }, { upsert: true });

        return Promise.all([i, j, k])
        /**
         * start batch write
         * */
        // create batch
        // const batch = this.stitch.db.firestore.batch();
        //
        // const patientRef = this.stitch.db.firestore
        //     .collection('patients').doc(patientID);
        //
        // batch.set(patientRef, patientDoc);
        //
        //
        // // batch write Hospital file
        // const patientFileRef = this.stitch.db.firestore.collection('hospitals')
        //     .doc(this.activehospital._id).collection('filenumbers').doc(patientID);
        // batch.set(patientFileRef, hospitalFileNumber);
        //
        //
        // // batch write the number of active patients
        // const numberOfPatientsRef = this.stitch.db.firestore.collection('hospitals').doc(this.activehospital._id);
        // batch.update(numberOfPatientsRef, {patientcount: this.activehospital.patientCount + 1});
        //
        // return batch.commit();
        return true as any;


    }


    /**
     * get all patients
     * */
    getHospitalPatients(): void {
        this.stitch.db.collection<HospFile>('patientfiles')
            .find({
                hospitalId: this.activehospital._id,
            }, { limit: 1000 })
            .toArray()
            .then(files => {

            });


        // const patientwatcher = this.stitch.db.collection<Patient>('patients')
        //     .find();

        // return combineLatest(patientfile, patientwatcher, (file, patient) => {
        //     return Object.assign(patient, { fileInfo: file });
        // });

        // this.stitch.db.collection('hospitals').doc(this.activehospital._id)
        //     .collection('filenumbers', ref => ref.limit(100)).snapshotChanges().pipe(
        //     switchMap(f => {
        //         return combineLatest(...f.map(t => {
        //             const hospitalfile = t.payload.doc.data() as HospFile;
        //             hospitalfile.id = t.payload.doc.id;
        //             return this.stitch.db.collection('patients').doc(hospitalfile.id).snapshotChanges().pipe(
        //                 map(patientdata => {
        //                     if (!patientdata.payload.exists) {
        //                         return {...emptypatient};
        //                     }
        //                     const patient = patientdata.payload.data() as Patient;
        //                     patient._id = patientdata.payload.id;
        //                     patient.fileInfo = hospitalfile;
        //                     return Object.assign({}, emptypatient, patient);
        //                 })
        //             );
        //         }));
        //     })
        // ).subscribe(mergedData => {
        //     this.hospitalpatients.next(mergedData.sort((a: Patient, b: Patient) => {
        //         return this.getTime(a.metadata.date.toDate()) - this.getTime(b.metadata.date.toDate());
        //     }));
        // });
    }

    addPatientToQueue({ type, description, insurance }: {
        type: PaymentChannel,
        description: string, insurance: Array<{ insuranceControl: string; insurancenumber: string; }>
    }, patient: Patient,
        selected: { insuranceControl: string, insurancenumber: string }): Promise<void> {
        /**
         * add patient to queue
         * */
        // todays date
        const todayDate = moment().toDate();

        /**
         * patient document ID
         * **/
        const queueID = '';


        /**
         * steps
         * 1. hospitalvisits
         * 2. filenumber last visit -- maybe when everything is done
         * 3.
         * */

        const visitTemp = {
            visitdescription: description,
            patientid: patient._id,
            hospitalid: this.activehospital._id,
            metadata: {
                date: todayDate,
                lastedit: todayDate
            },
            payment: {
                hasinsurance: type.name === 'insurance',
                splitpayment: false,
                status: false,
                total: 0,
                singlepayment: {
                    channelid: type._id,
                    amount: 0,
                    methidid: type.name === 'insurance' ? selected.insuranceControl : null,
                    transactionid: null
                }

            },
            id: queueID,
            checkin: {
                status: 0,
                admin: null
            }
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

    /***
     *
     * update patient
     * require
     * - patientID
     * - formData
     *
     *   return  Promise
     * */
    updatePatient(patientID: string, { personaLinfo, insurance, nextofkin }: AddPatientFormModel): Promise<any> {
        // get current data
        // const patientDataRef = this.stitch.db.firestore.collection('patients').doc(patientID);
        //
        // return this.stitch.db.firestore.runTransaction(transaction => {
        //     return transaction.get(patientDataRef).then(async sfDoc => {
        //         if (!sfDoc.exists) {
        //             Promise.reject('Document does not exist!');
        //             return;
        //         }
        //
        //         /**
        //          * get patient data
        //          * */
        //
        //         /**
        //          * fetch patient file
        //          * */
        //
        //         const fileDataDoc = await this.stitch.db.firestore.collection('hospitals')
        //             .doc(this.activehospital._id)
        //             .collection('filenumbers')
        //             .doc(patientID).get();
        //
        //
        //         const fileData = fileDataDoc.data() as HospFile;
        //
        //         /*
        //         * current data of patient
        //         * **/
        //         const firstData = Object.assign({}, emptypatient, sfDoc.data(), {fileinfo: fileData});
        //
        //         /**
        //          * now write the update
        //          * */
        //
        //             // todays date
        //         const todayDate = moment().toDate();
        //
        //         const tempInsurance = insurance.map((value, index: number) => {
        //             return {id: value.id, insuranceno: value.insurancenumber};
        //         });
        //
        //         const modifiedData = {
        //             id: patientID,
        //             personalinfo: {
        //                 name: personaLinfo.firstName + ' ' + personaLinfo.lastName,
        //                 address: personaLinfo.address,
        //                 gender: personaLinfo.gender,
        //                 occupation: personaLinfo.occupation,
        //                 workplace: personaLinfo.workplace,
        //                 phone: personaLinfo.phone,
        //                 email: personaLinfo.email,
        //                 idno: personaLinfo.idNo,
        //                 dob: moment(personaLinfo.birth, 'MM/DD/YYYY').toDate(),
        //             },
        //             nextofkin,
        //             insurance: tempInsurance,
        //             metadata: {
        //                 date: firstData.metadata.date,
        //                 lastedit: todayDate
        //             }
        //         };
        //
        //         const hospitalFileNumber = {
        //             id: patientID,
        //             date: firstData.fileInfo.date,
        //             lastvisit: todayDate,
        //             no: personaLinfo.fileno,
        //             idno: personaLinfo.idNo
        //         };
        //
        //
        //         const secondData = Object.assign({}, {...emptypatient}, {...modifiedData}, {fileinfo: hospitalFileNumber});
        //
        //         /**
        //          * updated data set, this should be the updated data
        //          * */
        //         const updatedPatientData = Object.assign({}, {...firstData}, {...secondData});
        //
        //         /**
        //          * do the transactions
        //          * */
        //
        //         const batched = [];
        //         batched.push(updatedPatientData);
        //         batched.push(updatedPatientData);
        //
        //
        //         const patientFileRef = this.stitch.db.firestore.collection('hospitals')
        //             .doc(this.activehospital._id).collection('filenumbers').doc(patientID);
        //
        //         // batch write the number of active patients
        //         const patientRef = this.stitch.db.firestore
        //             .collection('patients').doc(patientID);
        //
        //
        //         /**
        //          * return array
        //          * */
        //         Promise.all(batched.map(async (item: Patient, index) => {
        //             if (index === 0) {
        //                 await transaction.update(patientRef, modifiedData);
        //             } else if (index === 1) {
        //                 await transaction.update(patientFileRef, hospitalFileNumber);
        //             }
        //         }));
        //
        //     });
        // });
        return true as any;
    }

    searchPatient(field: string, value: string): any {

        /*
        * searchable items
        * - file number
        * - Id number
        * - mobile number
        * - name
        * **/

        if (field === 'no' || field === 'idno') {
            this.searchFromHospitalFile(field, value);
        } else if (field === 'phone' || field === 'name') {
            this.searchFromPatients(field, value);
        }
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
    getHospitalFileByNumber(fileNumber: string): Observable<HospFile[]> {
        // console.log('fetch hospital file');
        // return this.stitch.db.collection('hospitals')
        //     .doc(this.activehospital._id)
        //     .collection('filenumbers', ref => ref.where('no', '==', fileNumber))
        //     .snapshotChanges().pipe(
        //         debounceTime(500),
        //         map(actions => actions.map(action => {
        //             return action.payload.doc.data() as HospFile;
        //         }))
        //     );
        return true as any;

    }

    private getTime(date?: Date): any {
        return date != null ? date.getTime() : 0;
    }

    private searchFromHospitalFile(field: string, value: string): any {
        /**
         * search filenumber
         * search _id
         * */
        // this.stitch.db.collection('hospitals')
        //     .doc(this.activehospital._id)
        //     .collection('filenumbers', ref => {
        //         return ref.where(field, '==', value);
        //     }).snapshotChanges().pipe(
        //     switchMap(f => {
        //         if (f.length === 0) {
        //             return of([]);
        //         }
        //         return combineLatest(...f.map(t => {
        //             console.log('inside patient t');
        //             console.log(t);
        //             const fileInfo = t.payload.doc.data() as HospFile;
        //
        //             return this.stitch.db.collection('patients').doc(fileInfo.id).snapshotChanges().pipe(
        //                 map(patientData => {
        //                     console.log('inside patient data');
        //                     console.log(patientData);
        //                     return Object.assign({}, emptypatient, patientData.payload.data(), {fileinfo: fileInfo});
        //                 })
        //             );
        //         }));
        //
        //     })
        // ).subscribe(mergedData => {
        //     this.hospitalpatients.next(mergedData);
        // });
        return true as any;
    }

    private searchFromPatients(field: string, value: string): any {
        /**
         * search mobile number
         * search name
         * */

        // TODO: make sure something is done if the patient has no file number
        // this.stitch.db.collection('patients', ref => {
        //     return ref.where(`personalinfo.${field}`, '==', value);
        // }).snapshotChanges().pipe(
        //     switchMap(f => {
        //         if (f.length === 0) {
        //             of([]);
        //         }
        //         return combineLatest(...f.map(t => {
        //
        //             const patient = Object.assign({}, emptypatient, t.payload.doc.data());
        //
        //             return this.stitch.db.collection('hospitals')
        //                 .doc(this.activehospital._id)
        //                 .collection('filenumbers').doc(patient._id).snapshotChanges()
        //                 .pipe(
        //                     map(fileData => {
        //                         // TODO: return null if no patient
        //                         const patientFileData = fileData.payload.data() as HospFile;
        //                         patient.fileinfo = patientFileData;
        //
        //                         return patient;
        //                     })
        //                 );
        //         }));
        //     })
        // ).subscribe(mergedData => {
        //     this.hospitalpatients.next(mergedData);
        // });
        return true as any;
    }

}
