
import { Condition } from '../procedure/MedicalConditions.model';
import { Allegy } from '../procedure/Allergy.model';
import { Metadata } from '../universal';

export interface MedicalInfo {
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
}
