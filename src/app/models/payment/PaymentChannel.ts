import {BSON} from 'mongodb-stitch-browser-sdk';

export interface PaymentChannel {
    _id: BSON.ObjectId;
    name: string;
    /**
     * specifies whether this method can be merged with another for the same procedure
     */
    mergeability: {
        self: boolean,
        external: boolean
    };
    /**
     * specifies whether transaction details are to be collected under the payment methods
     */
    transactionDetailCollection: boolean;
    methods: {
        [key: string]: Paymentmethods
    };
}

export interface Paymentmethods {
    name: string;
    imageurl: string;
}

export const emptypaymentChannel: PaymentChannel = {
    name: null,
    _id: null,
    methods: {},
    mergeability: {
        self: false,
        external: false
    },
    transactionDetailCollection: false
};
