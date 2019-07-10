import {emptymetadata, Metadata} from '../universal';
import {BSON} from 'bson';

export interface HospitalAdmin {
    _id: BSON.ObjectId;
    status: boolean;
    data: {
        uid: string,
        email: string,
        photoURL: string,
        displayName: string,
    };
    config: {
        hospitalId: string
        categoryId: string
        level: number
        availability: number // Whether on break , away or available
    };
    profileData?: {
        bio: string,
        age: string,
        address: string,
        phone: string,
        status?: Boolean, // Whether olnine or offline
    };
    metadata: Metadata;

}

export const emptyadmin: HospitalAdmin = {
    _id: null,
    config: {
        level: null,
        hospitalId: null,
        availability: 0,
        categoryId: null
    },
    status: null,
    data: {
        email: null,
        uid: null,
        photoURL: null,
        displayName: null,
    },
    profileData: {
        address: null,
        age: null,
        bio: null,
        phone: null,
        status: null
    },
    metadata: emptymetadata

};
