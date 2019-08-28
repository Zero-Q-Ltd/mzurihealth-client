import { Injectable } from '@angular/core';
import { emptypatient, Insurance, NextofKin, Patient } from '../../models/patient/Patient';
import { Hospital } from '../../models/hospital/Hospital';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { HospitalService } from './hospital.service';
import { AdminService } from './admin.service';
import * as moment from 'moment';
import { emptyfile, HospFile } from '../../models/hospital/HospFile';
import { AddPatientFormModel } from '../../models/patient/AddPatientForm.model';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import 'rxjs/add/observable/empty';

import { BSON } from 'mongodb-stitch-browser-sdk';
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
            .findOne({ _id: patientid });

        const pt = combineLatest([patientfile, patientwatcher], (file, patient) => {
            return Object.assign(emptypatient, patient, { fileInfo: file }) as Patient;
        });

        return pt.toPromise();
    }

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
    savePatient({ personaLinfo, insurance, nextofkin, fileNo }: AddPatientFormModel): Promise<any> {
        /**
         * create data to insert to the patient collection
         * */
        const transformedNextOfKin: NextofKin = {
            name: nextofkin.name.toLowerCase(),
            relationship: nextofkin.relationship.toLowerCase(),
            phone: nextofkin.phone,
            workplace: nextofkin.workplace.toLowerCase()
        };

        const tempInsurance: Array<Insurance> = insurance.map((value, index: number) => {
            const i: Insurance = {
                _id: value._id,
                insuranceNo: value.insuranceNo
            };
            return i;
        });

        // todays date
        const todayDate = moment().toDate();

        /**
         * patient document ID
         * **/
        const patientID = new BSON.ObjectID();

        const newmeta = {
            date: moment().toDate(),
            adminId: this.adminservice.userdata._id,
            hospitalId: this.activehospital._id
        };

        const modifiedData: Patient = {
            _id: patientID,
            personalInfo: {
                name: personaLinfo.name.toLowerCase(),
                address: personaLinfo.address.toLowerCase(),
                gender: personaLinfo.gender,
                occupation: personaLinfo.occupation.toLowerCase(),
                workplace: personaLinfo.workplace.toLowerCase(),
                phone: personaLinfo.phone,
                email: personaLinfo.email.toLowerCase(),
                idno: personaLinfo.idno,
                dob: moment(personaLinfo.dob, 'MM/DD/YYYY').toDate(),
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
            date: todayDate,
            lastVisit: todayDate,
            hospitalId: this.activehospital._id,
            no: fileNo,
            visitCount: 0,
            patientId: patientID,
        };

        const hospitalFileNumber = Object.assign({}, emptyfile, hospitalFileNumberTemp);

        /**
         * create a file number associated with that hospital only
         */
        const i = this.stitch.db.collection<HospFile>('patientfiles')
            .insertOne(hospitalFileNumber);

        /**
         * create the patient
         */
        const j = this.stitch.db.collection<Patient>('patients')
            .insertOne(patientDoc);

        /**
         * Update the patient count in that hospital
         */
        const k = this.stitch.db.collection('hospitals')
            .updateOne({ _id: this.activehospital._id }, { $set: { $inc: { patientcount: 1 } } }, { upsert: true });

        return Promise.all([i, j, k]);

    }


    /**
     * get all patients
     * @TODO implement a custom paginator
     * */
    getHospitalPatients(): void {
        const patientdata = this.stitch.db.collection<Patient>('patients')
            .find({
                hospitalId: this.activehospital._id,
            }, { limit: 25 });
        const patientfiles = this.stitch.db.collection<HospFile>('patientfiles')
            .find({
                hospitalId: this.activehospital._id,
            }, { limit: 25, sort: { 'created.date': 1 } });
        combineLatest([patientfiles, patientdata], (f: Array<HospFile>, p: Array<Patient>) => {
            /**
             * crossmatch every file to its relevant patient by looping
             */
            const patients = p.map(patient => {
                /**
                 * There can only be one file associated with a patient
                 */
                return f.find(file => {
                    return file.patientId === patient._id;
                })[0];
            });
            this.hospitalpatients.next(patients);
        });
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
        console.log('called')
        return this.stitch.db.collection<HospFile>('patientfiles')
            .findOne({
                hospitalId: this.activehospital._id,
                no: fileNumber
            });

    }


}
