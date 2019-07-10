import {emptymetadata, Metadata} from '../universal';

export interface Patientnote {
    title: string;
    note: string;
    admin: {
        id: string,
        name: string
    };
    id: string;
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
    id: null,
    metadata: emptymetadata,
    admin: {
        id: null,
        name: null
    },
    helpful: 0
};
