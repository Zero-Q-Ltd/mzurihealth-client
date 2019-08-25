import {
    BSON
} from 'mongodb-stitch-browser-sdk';
import { Checkin } from '../visit/Visit';

/**
 * This is kept in an independent collection and keeps a reference to the hospital whole queue
 */
export interface Queue {
    _id: BSON.ObjectId;
    hospitalId: BSON.ObjectId; 
    queue: Array<QueueRefs>;
}

export interface QueueRefs {
    /**
     * The checkin is duplicated as a hack
     * Instead of keeping realtime subscriptions to the patient data, the data will be re-fetched when the status changes
     * This will help in keeping the database load low by avoiding too many subscriptions
     * 
     * And again, on the queue table, we are only interested with the patient info, the stage and admin.... we have more to 
     * gain by duplicating than the haste(kidogo sana) of keeping the data syncronised
     *
     * Okay... calling it kidogo sana was an understatement but still...
     */
    checkin: Checkin;
    fileId: BSON.ObjectId;
    patientId: BSON.ObjectId;
    visitId: BSON.ObjectId;
}
