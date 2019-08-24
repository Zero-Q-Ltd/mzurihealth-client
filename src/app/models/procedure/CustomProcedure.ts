import {emptymetadata, Metadata} from '../universal';
import {
    BSON
} from 'mongodb-stitch-browser-sdk';

export interface CustomProcedure {
    creatorid: string;
    _id: BSON.ObjectId;
    regularPrice: number;
    parentProcedureId: string;
    hospitalId: string;
    insurancePrices: {
        [key: string]: number
    };
    status: boolean;
    customInsurancePrice: boolean;
    metadata: Metadata;
}

export const emptycustomprocedure: CustomProcedure = {
    creatorid: null,
    _id: null,
    status: null,
    regularPrice: 0,
    insurancePrices: {},
    parentProcedureId: null,
    hospitalId: null,
    metadata: emptymetadata,
    customInsurancePrice: false
};
