import * as BSON from 'bson';

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
    adminId: string;
    hospitalId: BSON.ObjectId;
}

export const emptymetadata: Metadata = {
    created: null,
    edited: null,
};

export interface BaseMongoObject {
    _id: BSON.ObjectID;
}
