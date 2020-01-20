import {emptymetadata, Metadata} from '../universal';
import * as BSON from 'bson';

export interface AdminInvite {
    email: string;
    name: string;
    phone: string;
    categoyId: string;
    level: number;
    inviterId: string;
    hospitalId: BSON.ObjectId;
    metadata: Metadata;
    _id: BSON.ObjectId;
}

export const emptyadmininvite: AdminInvite = {
    email: null,
    name: null,
    phone: null,
    categoyId: null,
    level: null,
    inviterId: null,
    hospitalId: null,
    _id: null,
    metadata: emptymetadata
};
