import {
    BSON
} from 'mongodb-stitch-browser-sdk';

export interface HospFile {
    _id: BSON.ObjectId;
    date: Date;
    lastVisit: Date;
    no: string;
    idno: number;
    visitCount: number;
}

export const emptyfile: HospFile = {
    _id: null,
    date: null,
    lastVisit: null,
    no: '0',
    idno: null,
    visitCount: 0
};
