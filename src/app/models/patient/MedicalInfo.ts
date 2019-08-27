
import { Condition } from '../procedure/MedicalConditions.model';
import { Allegy } from '../procedure/Allergy.model';
import { Metadata, emptymetadata } from '../universal';
import {
    BSON
} from 'mongodb-stitch-browser-sdk';

export interface MedicalInfo {
    _id: BSON.ObjectId;
    bloodType: string;
    conditions: Array<Condition>;
    allergies: Array<Allegy>;
    vitals: {
        height: number,
        weight: number,
        pressure: number,
        sugar: number,
        heartRate: number,
        respiration: number,
        hb: string,
    };
    metadata: Metadata;
    visitId: BSON.ObjectId;
}

export const emptymedicalInfo: MedicalInfo = {
    _id: null,
    bloodType: null,
    conditions: [],
    allergies: [],
    vitals: {
        height: null,
        weight: null,
        pressure: null,
        sugar: null,
        heartRate: null,
        respiration: null,
        hb: null
    },
    visitId: null,
    metadata: emptymetadata
};
