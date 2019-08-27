import {Customfields, emptymetadata, Metadata} from '../universal';
import {HospFile} from '../hospital/file';
import {
    BSON
} from 'mongodb-stitch-browser-sdk';

export interface Patient {
    _id: BSON.ObjectId;
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
    /**
     * Optional parent id number for minors
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
    _id: BSON.ObjectId;
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
    status: true,
    exrainfo: null,
    primaryHosp: null,
    customFieelds: [],
    metadata: emptymetadata,
};

