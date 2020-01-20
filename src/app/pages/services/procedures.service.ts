import { Injectable } from '@angular/core';
import { RawProcedure } from 'app/models/procedure/RawProcedure';
import { Meta } from 'app/models/universal';
import * as moment from 'moment';
import { BSON, Stream } from 'mongodb-stitch-core-sdk';
import { ChangeEvent } from 'mongodb-stitch-core-services-mongodb-remote';
import { BehaviorSubject } from 'rxjs';
import { Hospital } from '../../models/hospital/Hospital';
import { CustomProcedure, CustomProcedureConfig } from '../../models/procedure/CustomProcedure';
import { MergedProcedureModel } from '../../models/procedure/MergedProcedure.model';
import { ProcedureCategory } from '../../models/procedure/ProcedureCategory';
import { NotificationService } from '../../shared/services/notifications.service';
import { AdminService } from './admin.service';
import { CoreService } from './core/core.service';
import { StitchService } from './stitch/stitch.service';

@Injectable({
    providedIn: 'root'
})
export class ProceduresService {

    procedureConfigsCollection = this.stitch.db.collection<CustomProcedureConfig>('procedureconfigs');
    proceduresCollection = this.stitch.db.collection<RawProcedure>('procedures');
    procedureCategoriesCollection = this.stitch.db.collection<ProcedureCategory>('procedurecategories');

    constructor(
        private stitch: StitchService) {

    }


    fetchproceduresincategory(categoryid: BSON.ObjectId, limit?: number): any {
        const query = {
            'category._id': categoryid
        };
        const options = {
            limit
        };

        return this.proceduresCollection
            .find(query, options)
            .toArray();
    }

    disableprocedure(procedure: CustomProcedure) {
        return true as any;
        // return this.db.firestore.collection('procedureconfigs').doc(procedureid).update({status: false});
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

        // this.proceduresCollection
        //     .insertMany(procedures);
    }

    addcustomprocedure(customprocedure: CustomProcedure, hospitalId: BSON.ObjectId, userId: string): any {

        customprocedure.hospitalId = hospitalId;
        customprocedure.status = true;
        customprocedure.creatorid = userId;

        const meta: Meta = {
            date: moment().toDate(),
            adminId: userId,
            hospitalId: hospitalId
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
        /**
         * wrote this long code for better readability
         */
        let newProcedureConfig: CustomProcedureConfig;
        // if (this.core.hospitalCustomProcedureConfig) {
        //     const query = {
        //         _id: this.hospitalCustomProcedureConfig._id
        //     };
        //     const temp = { ...this.hospitalCustomProcedureConfig };
        //     temp.metadata.edited = meta;
        //     return this.procedureConfigsCollection.updateOne(query, temp);
        // } else {
        newProcedureConfig = {
            _id: new BSON.ObjectId(),
            hospitalId: hospitalId,
            metadata: {
                created: meta,
                edited: meta
            },
            procedures: [customprocedure]
        };
        return this.procedureConfigsCollection.insertOne(newProcedureConfig);
        // }
    }


    editcustomprocedure(customprocedure: CustomProcedure, userId: string, hospitalId: BSON.ObjectId, customProcedureId: BSON.ObjectId): any {
        const query = {
            _id: customProcedureId
        };
        const options = {
            upsert: false
        };

        const meta: Meta = {
            date: moment().toDate(),
            adminId: userId,
            hospitalId: hospitalId
        };

        customprocedure.metadata = {
            created: meta,
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
        const update = {
            $set: {
                position: customprocedure
            }
        };
        return this.procedureConfigsCollection.updateOne(query, update, options);
    }

    deactivateprocedure(procedureid: string): any {

        // return this.db.firestore.collection('hospitals').doc(hospitalId).collection('procedures').doc(procedureid).delete();
    }
}
