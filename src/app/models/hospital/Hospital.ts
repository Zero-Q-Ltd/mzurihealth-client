import {emptymetadata, Metadata} from '../universal';
import {PaymentMethod} from '../payment/CustomPaymentMethod.model';

export interface Hospital {
    location: any;
    name: string;
    userid: string;
    _id: string;
    description: string;
    status: boolean;
    contactperson: {
        name: string,
        phone: string,
        email: string,
        position: string,
        address: string
    };
    contactDetails: {
        phone: string,
        email: string,
        address: string
    };
    logourl: string;
    patientCount: number;
    invoiceCount: number;
    metadata: Metadata;
    paymentMethods: Array<PaymentMethod>;
}

export const emptyhospital: Hospital = {
    contactperson: {
        email: null,
        name: null,
        phone: null,
        position: null,
        address: null
    },
    logourl: null,
    status: null,
    contactDetails: {
        email: null,
        phone: null,
        address: null
    },
    location: null,
    name: null,
    _id: null,
    userid: null,
    description: null,
    patientCount: null,
    invoiceCount: null,
    metadata: emptymetadata,
    paymentMethods: []
};
