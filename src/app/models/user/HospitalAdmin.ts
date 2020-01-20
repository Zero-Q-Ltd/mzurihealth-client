import * as BSON from 'bson';
import {StitchUser} from 'mongodb-stitch-browser-sdk';

export interface HospitalAdmin extends StitchUser {
    status: boolean;
    config: {
        hospitalId: BSON.ObjectId
        categoryId: string
        level: number
        availability: number // Whether on break , away or available
    };
}