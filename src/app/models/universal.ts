import {
    BSON
} from 'mongodb-stitch-browser-sdk';

export interface Customfields {
    id: number;
    value: any;
    name: string;
}

export interface Metadata {
    created: Meta;
    edited: Meta;
}
interface Meta {
    adminId: BSON.ObjectId;
    hospitalId: BSON.ObjectId;
}

export const emptymetadata: Metadata = {
    created: null,
    edited: null,
};
