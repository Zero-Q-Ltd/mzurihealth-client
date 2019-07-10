import {emptymetadata, Metadata} from '../universal';
import {Procedureperformed} from '../procedure/Procedureperformed';

export interface PatientVisit {
    procedures: Array<Procedureperformed>;
    totalcost: number;
    visitDescription: string;
    vitals: {
        height: number,
        weight: number,
        pressure: number,
        sugar: number,
        heartrate: number,
        respiration: number
    };
    generalNotes: Array<{
        adminid: string,
        notes: string
    }>;
    patientid: string;
    hospitalid: string;
    prescription: string;
    metadata: Metadata;
    payment: {
        splitPayment: boolean;
        total: number,
        status: boolean,
        hasInsurance: boolean,
        singlePayment?: {
            channelId: string;
            amount: number;
            methodId: string;
            transactionId: string
        }
    };
    id: string;
    invoiceId: number;
    checkin: Checkin;
}

export interface Checkin {
    admin: string;
    /**
     * 0 new
     * 1 waiting
     * 2 being attended
     * 3 waiting for payment
     * 4 completed
     */
    status: 0 | 1 | 2 | 3 | 4;
}

export const emptypatientvisit: PatientVisit = {
    procedures: [],
    totalcost: 0,
    visitDescription: null,
    vitals: {
        height: null,
        weight: null,
        pressure: null,
        sugar: null,
        heartrate: null,
        respiration: null
    },
    invoiceId: 0,
    generalNotes: [],
    checkin: {
        status: null,
        admin: null
    },
    payment: {
        splitPayment: false,
        total: 0,
        status: false,
        hasInsurance: false,
    },
    patientid: null,
    hospitalid: null,
    prescription: null,
    metadata: emptymetadata,
    id: null
};

