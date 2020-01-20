import { emptymetadata, Metadata } from '../universal';
import { RawProcedureCategory } from './RawProcedure';
import * as BSON from 'bson';


export interface Proceduresperformed {
    _id: BSON.ObjectId;
    procedures: Array<Procedureperformed>;
}

export interface Procedureperformed {
    category: RawProcedureCategory;
    results: string;
    /**
     * temporary storage for notes, useful for bulk addition of notes where the behavious of dynamic
     * arrays for ngmodel is unpredictable
     */
    tempnote?: string;
    notes: Array<ProcedureNotes>;
    adminid: BSON.ObjectId;
    name: string;
    originalProcedureId: BSON.ObjectID;
    customProcedureId: string;
    metadata: Metadata;
    payment: {
        amount: number,
        methods: Array<{
            channelid: string;
            amount: number;
            methidid: string;
            transactionid: string
        }>
        /**
         * whether one of the payment methods is insurance
         */
        hasInsurance: boolean
    };
}

export const emptyprocedureperformed: Procedureperformed = {
    category: null,
    results: null,
    notes: [],
    adminid: null,
    name: null,
    originalProcedureId: null,
    customProcedureId: null,
    metadata: emptymetadata,
    payment: {
        amount: 0,
        hasInsurance: false,
        methods: []
    }
};

export const emptyproceduresperformed: Proceduresperformed = {
    _id: null,
    procedures: []
};

export interface ProcedureNotes {

    note: string;
    admin: {
        id: string,
        name: string
    };

}
