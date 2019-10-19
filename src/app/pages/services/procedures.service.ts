import { Injectable } from '@angular/core';
import { HospitalService } from './hospital.service';
import { BehaviorSubject } from 'rxjs';
import { Hospital } from '../../models/hospital/Hospital';
import { CustomProcedure } from '../../models/procedure/CustomProcedure';
import { ProcedureCategory } from '../../models/procedure/ProcedureCategory';
import { NotificationService } from '../../shared/services/notifications.service';
import { HospitalAdmin } from '../../models/user/HospitalAdmin';
import { AdminService } from './admin.service';
import * as moment from 'moment';
import { MergedProcedureModel } from '../../models/procedure/MergedProcedure.model';
import { Meta } from 'app/models/universal';
import { Stream, BSON } from 'mongodb-stitch-core-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';
import * as proceduredata from 'assets/procedures.json';
import * as procedurecats from 'assets/procedurecategories.json';
import { StitchService } from './stitch/stitch.service';
import { Visit } from 'app/models/visit/Visit';
import { RawProcedure } from 'app/models/procedure/RawProcedure';

@Injectable({
    providedIn: 'root'
})
export class ProceduresService {
    hospitalprocedures: BehaviorSubject<Array<MergedProcedureModel>> =
        new BehaviorSubject<Array<MergedProcedureModel>>([]);
    activehospital: Hospital;
    categories: BehaviorSubject<Array<ProcedureCategory>> = new BehaviorSubject<Array<ProcedureCategory>>([]);
    userdata: HospitalAdmin;

    /**
     * This keeps a list of all the subscriptions TO THE DATABASE that have been made by this service
     * It's to be maintined as a standard across all services
     */
    subscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();

    constructor(private hospitalservice: HospitalService,
        private notificationservice: NotificationService,
        private adminservice: AdminService,
        private stitch: StitchService) {
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

    fetchproceduresincategory(categoryid: string, limit?: number): any {
        const query = {
            'category._id': categoryid
        };
        const options = {
            limit
        };

        return this.stitch.db.collection<RawProcedure>('procedures')
            .find(query, options)
            .toArray();
        // return this.db.firestore.collection('procedures').where('category._id', '==', categoryId);
    }

    disableprocedure(procedureid: string) {
        return true as any;
        // return this.db.firestore.collection('procedureconfigs').doc(procedureid).update({status: false});
    }

    getprocedurecategories(): void {
        const query = {

        };
        const options = {
            sort: {
                name: 1
            }
        };

        this.stitch.db.collection<ProcedureCategory>('procedurecategories')
            .find(query, options)
            .toArray()
            .then(values => {
                this.categories.next(values);
                this.syncprocedures();
            })
            ;
    }

    syncprocedures(): any {
        interface RawprocedureFromjson {
            CODE: string;
            Name: string;
            Minimum: string;
            Maximum: string;
            Type: string;
            Category: string;
            Code: string;
            SubCategoty: string;
            NUMERICID: string;
            Notes: string;
        }
        interface RawProcedureCategoryFromjson {
            name: string;
            code: string;
            subcategories: {
                [key: number]: {
                    name: string;
                    parents: Array<number> | null
                }
            };
        }

        /**
         * In case you ever need to rewrite the categories again, make sure to also rewrite the procedures as new ids will be assigned
         * also remember to add the import statement for the json
         * import * as proceduredata from 'assets/procedures.json';
         */
        // const data = procedurecats.categories.map((category: RawProcedureCategoryFromjson) => {
        //     if (category.subcategories) {
        //         Object.keys(category.subcategories).forEach(key => {
        //             category.subcategories[key].name = category.subcategories[key].name.toLowerCase();
        //         });
        //     }
        //     const newcategory: ProcedureCategory = {
        //         _id: new BSON.ObjectId(),
        //         code: category.code.toLocaleLowerCase(),
        //         name: category.name.toLowerCase(),
        //         status: true,
        //         subcategories: category.subcategories
        //     };
        //     return newcategory;
        // });
        // console.log(data);

        // this.stitch.db.collection<ProcedureCategory>('procedurecategories')
        //     .insertMany(data)
        //     .then(() => {
        //         console.log('success writing');
        //     })
        //     .catch(e => {
        //         console.log('error', e);
        //     });



        // console.log(this.procedurecategories.value);
        // const procedures = proceduredata['Table 1'].map((proc: RawprocedureFromjson) => {
        //     // console.log(proc);
        //     const procedurecategory = this.procedurecategories.value.find(cat => {
        //         // console.log(cat.name.toLowerCase(), proc.Type.toLocaleLowerCase());
        //         return cat.name.toLowerCase() === proc.Type.toLocaleLowerCase();
        //     });
        //     // console.log(procedurecategory);
        //     const subcategories = procedurecategory.subcategories || null;

        //     const belongingcategory = Object.entries(subcategories || {}).find((val) => {
        //         if (val) {
        //             if (proc.SubCategoty) {
        //                 return val[1].name.toLocaleLowerCase() === proc.SubCategoty.toLocaleLowerCase();
        //             } else {
        //                 if (proc.Category) {
        //                     return val[1].name.toLocaleLowerCase() === proc.Category.toLocaleLowerCase();
        //                 } else {
        //                     console.log('This procedure does not belong to any category');
        //                     return false;
        //                 }
        //             }
        //         }
        //     });
        //     const newprocedure: RawProcedure = {
        //         pricing: {
        //             max: Number(proc.Maximum) || null,
        //             min: Number(proc.Minimum) || null
        //         },
        //         category: {
        //             _id: procedurecategory._id,
        //             subCategoryId: belongingcategory ? belongingcategory[0] : null,
        //             code: proc.Code || null
        //         },
        //         numericid: Number(proc.NUMERICID) || null,
        //         _id: null,
        //         name: proc.Name ? proc.Name.toLowerCase() : '',
        //         notes: proc.Notes
        //     };
        //     // console.log(newprocedure);
        //     return newprocedure;
        // });

        // this.stitch.db.collection<RawProcedure>('procedures')
        //     .insertMany(procedures);
    }

    addcustomprocedure(customprocedure: CustomProcedure): any {
        customprocedure._id = new BSON.ObjectId();
        customprocedure.hospitalId = this.activehospital._id;
        customprocedure.status = true;
        customprocedure.creatorid = this.userdata._id;

        const meta: Meta = {
            date: moment().toDate(),
            adminId: this.adminservice.userdata._id,
            hospitalId: this.hospitalservice.activehospital.value._id
        };

        customprocedure.metadata = {
            created: meta,
            edited: meta,
        };

        /**
         * remove insurance prices set to 0
         */
        Object.keys(customprocedure.insurancePrices).forEach(key => {
            if (customprocedure.insurancePrices[key] === 0 || customprocedure.insurancePrices[key] === null) {
                delete customprocedure.insurancePrices[key];
            }
        });
        return this.stitch.db.collection<CustomProcedure>('procedureconfigs').insertOne(customprocedure);

        // return this.db.firestore.collection('procedureconfigs').add(customProcedure);
    }

    editcustomprocedure(customprocedure: CustomProcedure): any {
        const query = {
            _id: customprocedure._id
        };
        const options = {
            upsert: false
        };

        customprocedure.creatorid = this.userdata._id;

        const meta: Meta = {
            date: moment().toDate(),
            adminId: this.adminservice.userdata._id,
            hospitalId: this.hospitalservice.activehospital.value._id
        };

        customprocedure.metadata = {
            edited: meta,
        };
        /**
         * remove insurance prices set to 0
         */
        Object.keys(customprocedure.insurancePrices).forEach(key => {
            if (!customprocedure.insurancePrices[key] || customprocedure.insurancePrices[key] === 0 || customprocedure.insurancePrices[key] === null) {
                delete customprocedure.insurancePrices[key];
            }
        });

        return this.stitch.db.collection<CustomProcedure>('procedureconfigs').updateOne(query, customprocedure, options);

        // return this.db.firestore.collection('procedureconfigs').doc(customProcedure.id).update(customProcedure);
    }

    deactivateprocedure(procedureid: string): any {

        // return this.db.firestore.collection('hospitals').doc(this.activehospital._id).collection('procedures').doc(procedureid).delete();
    }
}
