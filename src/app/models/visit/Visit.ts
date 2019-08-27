import {emptymetadata, Metadata} from '../universal';
import {Procedureperformed} from '../procedure/Procedureperformed';
import {
    BSON
} from 'mongodb-stitch-browser-sdk';

export interface Visit {
    procedures: Array<Procedureperformed>;
    totalcost: number;
    visitDescription: string;

    generalNotes: Array<{
        adminid: string,
        notes: string
    }>;
    patientId: BSON.ObjectId;
    hospitalId: BSON.ObjectId;
    prescription: string;
    metadata: Metadata;
    payment: {
        splitPayment: boolean;
        total: number,
        status: boolean,
        hasInsurance: boolean,
        singlePayment?: {
            channelId: BSON.ObjectId;
            amount: number;
            methodId: string;
            transactionId: string
        }
    };
    _id: BSON.ObjectId;
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


export const emptypatientvisit: Visit = {
    procedures: [],
    totalcost: 0,
    visitDescription: null,

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
    _id: null
};

