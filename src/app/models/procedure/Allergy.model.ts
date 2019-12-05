import { Metadata } from '../universal';

export enum allergy {
    'Respiratory' = 'respiratory',
    'Food' = 'Food',
    'skin' = 'skin',
    'other' = 'other'
}
export const allerytypearray = Object.values(allergy);

export interface Allegy {
    type: allergy;
    detail: string;
    metadata: Metadata;
}
