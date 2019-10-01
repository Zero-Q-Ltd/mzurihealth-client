import {emptymetadata, Metadata} from '../universal';
import {BSON} from 'mongodb-stitch-browser-sdk';

export interface Patientnote {
    title: string;
    note: string;
    admin: {
        _id: BSON.ObjectId,
        name: string
    };
    _id: BSON.ObjectId;
    patientId: string;
    metadata: Metadata;
    /**
     * distributed counter for docs that found this note helpful
     */
    helpful: number;
}

export const emptynote: Patientnote = {
    title: null,
    note: null,
    patientId: null,
    _id: null,
    metadata: emptymetadata,
    admin: {
        _id: null,
        name: null
    },
    helpful: 0
};
