import {Customfields, emptymetadata, Metadata} from '../universal';
import {HospFile} from '../hospital/file';
import {Condition} from '../procedure/MedicalConditions.model';
import {Allegy} from '../procedure/Allergy.model';

export interface Patient {
    personalInfo: {
        address: string,
        photoURL: string
        name: string,
        gender: number,
        occupation: string,
        workplace: string,
        phone: number,
        email: string,
        idno: string,
        dob: Date,
    };
    fileInfo?: HospFile;
    _id: string;
    /**
     * Optional parent _id number for minors
     */
    parentid?: string;

    nextofKin: {
        name: string,
        relationship: string,
        phone: number,
        workplace: string
    };
    /**
     * A patient can have several insurances at the same time
     */
    insurance: Array<Insurance>;
    medicalInfo: {
        bloodType: string,
        conditions: Array<Condition>
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
    };
    /**
     * used in queries so that you can optionally disable some patients
     */
    status: boolean;
    exrainfo: string;
    customFieelds?: Array<Customfields>;
    primaryHosp: string;
    metadata: Metadata;
}

export interface Insurance {
    id: string;
    insuranceNo: string;
}

export const emptypatient: Patient = {
    personalInfo: {
        address: null,
        photoURL: null,
        name: null,
        gender: 0,
        occupation: null,
        workplace: null,
        phone: null,
        email: null,
        idno: null,
        dob: null,
    },
    _id: null,
    nextofKin: {
        name: null,
        relationship: null,
        phone: null,
        workplace: null
    },
    insurance: [],
    medicalInfo: {
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
        metadata: emptymetadata
    },
    status: true,
    exrainfo: null,
    primaryHosp: null,
    customFieelds: [],
    metadata: emptymetadata,
};

