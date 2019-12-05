import { Condition } from '../procedure/MedicalConditions.model';
import { Allegy } from '../procedure/Allergy.model';
import { emptymetadata, Metadata } from '../universal';
import * as BSON from 'bson';

export interface MedicalInfo {
    _id: BSON.ObjectId;
    patientId: BSON.ObjectId;
    bloodType: string;
    conditions: Array<Condition>;
    allergies: Array<Allegy>;
    vitals: Vitals;
    metadata: Metadata;
    visitId: BSON.ObjectId;
}
export interface Vitals {
    height: number;
    weight: number;
    pressure: number;
    sugar: number;
    heartRate: number;
    respiration: number;
    hb: string;
}
export const emptymedicalInfo: MedicalInfo = {
    _id: null,
    patientId: null,
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
