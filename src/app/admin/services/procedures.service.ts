import {Injectable} from '@angular/core';
import {HospitalService} from './hospital.service';
import {BehaviorSubject} from 'rxjs';
import {Hospital} from '../../models/hospital/Hospital';
import {CustomProcedure} from '../../models/procedure/CustomProcedure';
import {ProcedureCategory} from '../../models/procedure/ProcedureCategory';
import {NotificationService} from '../../shared/services/notifications.service';
import {HospitalAdmin} from '../../models/user/HospitalAdmin';
import {AdminService} from './admin.service';
import * as moment from 'moment';
import {MergedProcedureModel} from '../../models/procedure/MergedProcedure.model';

@Injectable({
    providedIn: 'root'
})
export class ProceduresService {
    hospitalprocedures: BehaviorSubject<Array<MergedProcedureModel>> =
        new BehaviorSubject<Array<MergedProcedureModel>>([]);
    activehospital: Hospital;
    procedurecategories: BehaviorSubject<Array<ProcedureCategory>> = new BehaviorSubject<Array<ProcedureCategory>>([]);
    userdata: HospitalAdmin;

    constructor(private hospitalservice: HospitalService,
                private notificationservice: NotificationService,
                private adminservice: AdminService) {
        this.hospitalservice.activehospital.subscribe(hospital => {
            if (hospital._id) {
                this.activehospital = hospital;
                this.getprocedures();
                this.getprocedurecategories();
            }
        });
        this.adminservice.observableuserdata.subscribe(userdata => {
            this.userdata = userdata as HospitalAdmin;
        });
    }

    getprocedures(): void {
        /**
         * I honestly am not sure why the following code works so well
         * Please.... be very careful before changing
         */
        // this.db.collection('procedureconfigs', ref => ref.where('hospitalId', '==', this.activehospital._id).where('status', '==', true)).snapshotChanges().pipe(
        //     switchMap(f => {
        //         return combineLatest(...f.map(t => {
        //             const customProcedure = t.payload.doc.data() as CustomProcedure;
        //             customProcedure.id = t.payload.doc.id;
        //             return this.db.collection('procedures').doc(customProcedure.parentProcedureId).snapshotChanges().pipe(
        //                 map(originalproceduredata => {
        //                     const rawProcedure = originalproceduredata.payload.data() as RawProcedure;
        //                     rawProcedure.id = originalproceduredata.payload.id;
        //                     return ({rawProcedure: rawProcedure, customProcedure: customProcedure});
        //                 })
        //             );
        //         }));
        //     })
        // ).subscribe(mergedData => {
        //     this.hospitalprocedures.next(mergedData);
        // });
    }

    fetchproceduresincategory(categoryid: string): any {
        // return this.db.firestore.collection('procedures').where('category._id', '==', categoryId);
    }

    disableprocedure(procedureid: string) {
        return true as any;
        // return this.db.firestore.collection('procedureconfigs').doc(procedureid).update({status: false});
    }

    getprocedurecategories(): void {
        // this.db.firestore.collection('procedurecategories').orderBy('name', 'asc').onSnapshot(rawdocs => {
        //     this.procedurecategories.next(rawdocs.docs.map(rawdoc => {
        //         const procedurecategory: ProcedureCategory = rawdoc.data() as ProcedureCategory;
        //         procedurecategory.id = rawdoc.id;
        //         return procedurecategory;
        //     }));
        //     // console.log('done fetching ');
        // });
    }

    syncprocedures(): any {
        interface RawprocedureFromjson {
            'CODE': string;
            'Name': string;
            'Minimum': string;
            'Maximum': string;
            'Type': string;
            'Category': string;
            'Code': string;
            'SubCategoty': string;
            'NUMERICID': string;
        }

        /**
         * In case you ever need to rewrite the categories again, make sure to also rewrite the procedures as new ids will be assigned
         * also remember to add the import statement for the json
         * import * as proceduredata from 'assets/procedures.json';
         */
        /*procedurecats.categories.forEach(async (category: ProcedureCategory) => {
          let batch = this.db.firestore.batch();
          category.name = category.name.toLowerCase();
          if(category.subcategories){
            Object.keys(category.subcategories).forEach(key =>{
              category.subcategories[key].name = category.subcategories[key].name.toLowerCase();
            });
          }
          batch.set(this.db.firestore.collection('procedurecategories').doc(this.db.createId()), category);
          return await batch.commit();
        });*/
        // return Promise.all(
        //     proceduredata['Table 1'].forEach(async (proc: rawProcedure) => {
        //         let batch = this.db.firestore.batch();
        //
        //         let procedurecategory = this.procedurecategories.value.find(cat => {
        //             return cat.name.toLowerCase() == proc.Type.toLocaleLowerCase();
        //         });
        //         let subcategories = procedurecategory.subcategories;
        //         let belongingcategory = Object.entries(subcategories || {}).find((val) => {
        //             if (val) {
        //                 if (proc.SubCategoty) {
        //                     return val[1].name.toLocaleLowerCase() === proc.SubCategoty.toLocaleLowerCase();
        //                 } else {
        //                     if (proc.Category) {
        //                         return val[1].name.toLocaleLowerCase() === proc.Category.toLocaleLowerCase();
        //                     } else {
        //                         console.log('This procedure does not belong to any category');
        //                         return false;
        //                     }
        //                 }
        //             }
        //         });
        //         let newprocedure: RawProcedure = {
        //             pricing: {
        //                 max: Number(proc.Maximum) || null,
        //                 min: Number(proc.Minimum) || null
        //             },
        //             category: {
        //                 _id: procedurecategory._id,
        //                 subCategoryId: belongingcategory ? belongingcategory[0] : null,
        //                 code: proc.Code || null
        //             },
        //             numericid: Number(proc.NUMERICID) || null,
        //             _id: null,
        //             name: proc.Name ? proc.Name.toLowerCase() : ''
        //         };
        //         console.log(newprocedure);
        //         batch.set(this.db.firestore.collection('procedures').doc(this.db.createId()), newprocedure);
        //         return await batch.commit();
        //     })).then(() => {
        //     this.notificationservice.notify({
        //         alertType: 'success',
        //         body: 'Procedures added',
        //         title: 'Success',
        //         placement: 'center'
        //     });
        // });
    }

    addcustomprocedure(customprocedure: CustomProcedure): any {
        customprocedure.hospitalId = this.activehospital._id;
        customprocedure.status = true;
        customprocedure.creatorid = this.userdata._id;
        customprocedure.metadata = {
            lastEdit: moment().toDate(),
            date: moment().toDate()
        };
        /**
         * remove insurance prices set to 0
         */
        Object.keys(customprocedure.insurancePrices).forEach(key => {
            if (customprocedure.insurancePrices[key] === 0 || customprocedure.insurancePrices[key] === null) {
                delete customprocedure.insurancePrices[key];
            }
        });
        // return this.db.firestore.collection('procedureconfigs').add(customProcedure);
    }

    editcustomprocedure(customprocedure: CustomProcedure): any {
        customprocedure.creatorid = this.userdata._id;
        customprocedure.metadata = {
            lastEdit: moment().toDate(),
            date: customprocedure.metadata.date
        };
        /**
         * remove insurance prices set to 0
         */
        Object.keys(customprocedure.insurancePrices).forEach(key => {
            if (!customprocedure.insurancePrices[key] || customprocedure.insurancePrices[key] === 0 || customprocedure.insurancePrices[key] === null) {
                delete customprocedure.insurancePrices[key];
            }
        });
        // return this.db.firestore.collection('procedureconfigs').doc(customProcedure.id).update(customProcedure);
    }

    deactivateprocedure(procedureid: string): any {

        // return this.db.firestore.collection('hospitals').doc(this.activehospital._id).collection('procedures').doc(procedureid).delete();
    }
}
