import { emptymetadata, Metadata } from '../universal';
import * as BSON from 'bson';

export interface Patientnote {
    title: string;
    note: string;
    _id: BSON.ObjectId;
    patientId: BSON.ObjectId;
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
    helpful: 0
};
