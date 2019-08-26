import {
    BSON
} from 'mongodb-stitch-browser-sdk';

export interface Customfields {
    id: number;
    value: any;
    name: string;
}

export interface Metadata {
    /**
     * Sometimes we may just want to modify the last edited date
     */
    created?: Meta;
    edited: Meta;
}
export interface Meta {
    date: Date;
    adminId: BSON.ObjectId;
    hospitalId: BSON.ObjectId;
}

export const emptymetadata: Metadata = {
    created: null,
    edited: null,
};
