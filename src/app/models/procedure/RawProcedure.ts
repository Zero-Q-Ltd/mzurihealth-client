import {BSON} from 'mongodb-stitch-browser-sdk';

export interface RawProcedure {
    name: string;
    _id: BSON.ObjectId;
    pricing: {
        max: number | string,
        min: number | string,
    };
    category: RawProcedureCategory;
    numericid: number;
    notes : string
}

export interface RawProcedureCategory {
    _id: BSON.ObjectId;
    code: string;
    subCategoryId: string | null;
}

export const emptyprawrocedure: RawProcedure = {
    name: null,
    _id: null,
    pricing: {
        min: 0,
        max: 0
    },
    numericid: null,
    category: {
        _id: null,
        code: null,
        subCategoryId: null
    },
    notes: ""
};
