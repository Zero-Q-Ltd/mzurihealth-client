import {emptymetadata, Metadata} from '../universal';

export interface AdminInvite {
    email: string;
    name: string;
    phone: string;
    categoyId: string;
    level: number;
    inviterId: string;
    hospitalId: string;
    metadata: Metadata;
    id: string;
}

export const emptyadmininvite: AdminInvite = {
    email: null,
    name: null,
    phone: null,
    categoyId: null,
    level: null,
    inviterId: null,
    hospitalId: null,
    id: null,
    metadata: emptymetadata
};
