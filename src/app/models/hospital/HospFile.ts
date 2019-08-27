import {
    BSON
} from 'mongodb-stitch-browser-sdk';

export interface HospFile {
    _id: BSON.ObjectId;
    hospitalId: BSON.ObjectId;
    date: Date;
    lastVisit: Date;
    no: string;
    visitCount: number;
    patientId: BSON.ObjectId;
}

export const emptyfile: HospFile = {
    _id: null,
    hospitalId : null,
    date: null,
    lastVisit: null,
    no: '0',
    visitCount: 0,
    patientId : null
};
