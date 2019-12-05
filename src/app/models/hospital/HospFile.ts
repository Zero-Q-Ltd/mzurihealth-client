import * as BSON from 'bson';
import { Metadata, emptymetadata } from '../universal';

export interface HospFile {
    _id: BSON.ObjectId;
    hospitalId: BSON.ObjectId;
    lastVisit: Date;
    no: string;
    visitCount: number;
    patientId: BSON.ObjectId;
    metadata: Metadata;
}

export const emptyfile: HospFile = {
    _id: null,
    hospitalId: null,
    lastVisit: null,
    no: '0',
    visitCount: 0,
    patientId: null,
    metadata: emptymetadata
};
