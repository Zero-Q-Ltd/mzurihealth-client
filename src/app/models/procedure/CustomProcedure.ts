import {emptymetadata, Metadata} from '../universal';
import * as BSON from 'bson';

export interface CustomProcedure {
    creatorid: string;
    regularPrice: number;
    parentId: BSON.ObjectId;
    hospitalId: BSON.ObjectId;
    insurancePrices: {
        [key: string]: number
    };
    status: boolean;
    customInsurancePrice: boolean;
    metadata: Metadata;
}

export interface CustomProcedureConfig {
    _id: BSON.ObjectId;
    metadata: Metadata;
    hospitalId: BSON.ObjectId;
    /**
     * These are stored in the same document as they are often needed together and rarely change
     */
    procedures: Array<CustomProcedure>;
}

export const emptycustomprocedure: CustomProcedure = {
    creatorid: null,
    status: null,
    regularPrice: 0,
    insurancePrices: {},
    parentId: null,
    hospitalId: null,
    metadata: emptymetadata,
    customInsurancePrice: false
};
