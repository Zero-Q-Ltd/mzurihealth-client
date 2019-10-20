import { emptymetadata, Metadata } from '../universal';
import { BSON } from 'mongodb-stitch-browser-sdk';

export interface CustomProcedure {
    creatorid: BSON.ObjectId;
    regularPrice: number;
    parentProcedureId: BSON.ObjectId;
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
    procedures: Array<CustomProcedure>;
}
export const emptycustomprocedure: CustomProcedure = {
    creatorid: null,
    status: null,
    regularPrice: 0,
    insurancePrices: {},
    parentProcedureId: null,
    hospitalId: null,
    metadata: emptymetadata,
    customInsurancePrice: false
};
