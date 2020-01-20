import { HospitalService } from './hospital.service';
import { Injectable } from '@angular/core';
import { QueueService } from './core/queue.service';
import { Patientnote } from '../../models/patient/Patientnote';
import * as moment from 'moment';
import { Stream } from 'mongodb-stitch-browser-sdk';
import { Meta } from 'app/models/universal';
import { ChangeEvent, RemoteFindOptions, RemoteInsertOneResult } from 'mongodb-stitch-core-services-mongodb-remote';
import * as BSON from 'bson';
import { StitchService } from './stitch/stitch.service';
import { CoreService } from './core/core.service';

@Injectable({
    providedIn: 'root'
})
export class PatientnotesService {
    patientid: BSON.ObjectId;
    patientNotesCollection = this.stitch.db.collection<Patientnote>('patientnotes');
    /**
     * This keeps a list of all the subscriptions TO THE DATABASE that have been made by this service
     * It's to be maintined as a standard across all services
     */
    subscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();

    constructor(
        private stitch: StitchService, ) {

    }


    addnote(note: Patientnote, userId: string, hospitalId: BSON.ObjectId): Promise<RemoteInsertOneResult> {

        note.patientId = this.patientid;
        const meta: Meta = {
            date: moment().toDate(),
            adminId: userId,
            hospitalId
        };
        note.metadata = {
            created: meta,
            edited: meta,
        };
        return this.patientNotesCollection.insertOne(note);

    }

    editnote(): void {

    }
}
