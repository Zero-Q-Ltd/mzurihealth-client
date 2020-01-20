import { HospitalService } from './hospital.service';
import { Injectable } from '@angular/core';
import { QueueService } from './queue.service';
import { Patientnote, emptynote } from '../../models/patient/Patientnote';
import { AdminService } from './admin.service';
import * as moment from 'moment';
import { Stream, RemoteMongoReadOperation } from 'mongodb-stitch-browser-sdk';
import { Meta } from 'app/models/universal';
import { ChangeEvent, RemoteUpdateResult, RemoteInsertOneResult, RemoteFindOptions } from 'mongodb-stitch-core-services-mongodb-remote';
import * as BSON from 'bson';
import { StitchService } from './stitch/stitch.service';

@Injectable({
    providedIn: 'root'
})
export class PatientnotesService {
    patientid: BSON.ObjectId;

    /**
     * This keeps a list of all the subscriptions TO THE DATABASE that have been made by this service
     * It's to be maintined as a standard across all services
     */
    subscriptions: Map<string, Stream<ChangeEvent<any>>> = new Map();

    constructor(private queueservice: QueueService,
        private hospitalservice: HospitalService,
        private stitch: StitchService,
        private adminservice: AdminService) {
        queueservice.currentpatient.subscribe(value => {
            if (value.patientdata._id) {
                this.patientid = value.patientdata._id;
                this.fetchpatientnotes(value.patientdata._id);
            }
        });
    }

    fetchpatientnotes(patientId: BSON.ObjectId): Promise<Patientnote[]> {
        const query = {
            patientId: patientId
        };
        const options: RemoteFindOptions = {
            limit: 100,
            sort: {
                'metadata.date': 1
            }
        };
        return this.stitch.db.collection<Patientnote>('patientnotes')
            .find(query, options)
            .toArray();
    }

    addnote(note: Patientnote): Promise<RemoteInsertOneResult> {
        note.admin = {
            id: this.adminservice.userdata.id,
            name: this.adminservice.userdata.profile.name
        };
        note.patientId = this.patientid;
        const meta: Meta = {
            date: moment().toDate(),
            adminId: this.adminservice.userdata.id,
            hospitalId: this.hospitalservice.activehospital.value._id
        };
        note.metadata = {
            created: meta,
            edited: meta,
        };
        return this.stitch.db.collection('patientnotes').insertOne(note);

    }

    editnote(): void {

    }
}
