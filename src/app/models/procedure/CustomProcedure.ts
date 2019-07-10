import {emptymetadata, Metadata} from '../universal';

export interface CustomProcedure {
    creatorid: string;
    id: string;
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
    id: null,
    status: null,
    regularPrice: 0,
    insurancePrices: {},
    parentProcedureId: null,
    hospitalId: null,
    metadata: emptymetadata,
    customInsurancePrice: false
};
