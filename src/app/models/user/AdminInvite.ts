import {emptymetadata, Metadata} from '../universal';
import {BSON} from 'mongodb-stitch-browser-sdk';

export interface AdminInvite {
    email: string;
    name: string;
    phone: string;
    categoyId: string;
    level: number;
    inviterId: BSON.ObjectId;
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
