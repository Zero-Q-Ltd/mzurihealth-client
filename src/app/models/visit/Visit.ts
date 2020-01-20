import { emptymetadata, Metadata } from '../universal';
import { Procedureperformed } from '../procedure/Procedureperformed';
import { Prescription } from './Prescription';
import { Insurance } from '../patient/Patient';
import { PaymentChannel } from '../payment/PaymentChannel';
import * as BSON from 'bson';

export interface Visit {
    procedures: Array<Procedureperformed>;
    totalcost: number;
    visitDescription: string;

    generalNotes: Array<{
        adminid: string,
        notes: string
    }>;
    patientId: BSON.ObjectId;
    prescription: Prescription;
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
    status: CheckinStatus;
}

export enum CheckinStatus {
    'new',
    'waiting',
    'being attended',
    'waiting for payment',
    'completed'
}

/**
 * During reg it is important to distinguish between cash and isurance patients
 * In case it's a cash method, don't bother with details until during payment
 */
export interface NewVisit {
    payment: PaymentChannel;
    insurance: Array<Insurance>;
    /**
     * An id among the insurance array
     */
    selectedInsurance: number;
    description: string;
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
    patientId: null,
    prescription: null,
    metadata: emptymetadata,
    _id: null
};

