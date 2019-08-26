import { HospitalService } from './hospital.service';
import {Injectable} from '@angular/core';
import {QueueService} from './queue.service';
import {BehaviorSubject} from 'rxjs';
import {emptynote, Patientnote} from '../../models/patient/Patientnote';
import {AdminService} from './admin.service';
import * as moment from 'moment';
import {
    BSON
} from 'mongodb-stitch-browser-sdk';
import { Meta } from 'app/models/universal';

@Injectable({
    providedIn: 'root'
})
export class PatientnotesService {
    patientnotes: BehaviorSubject<Array<Patientnote>> = new BehaviorSubject<Array<Patientnote>>([]);
    patientid: string;

    constructor(private queueservice: QueueService,
        private hospitalservice: HospitalService,
        private adminservice: AdminService) {
        queueservice.currentpatient.subscribe(value => {
            if (value.patientdata._id) {
                this.patientid = value.patientdata._id;
                this.fetchpatientnotes(value.patientdata._id);
            }
        });
    }

    fetchpatientnotes(_id: BSON.ObjectId): void {
        // this.stitch.db.collection('patientnotes')
        //     .where('patientId', '==', id)
        //     .limit(100)
        //     .orderBy('metadata.date', 'desc')
        //     .onSnapshot(rawdata => {
        //         this.patientnotes.next(rawdata.docs.map(value => {
        //             return Object.assign({...emptynote}, value.data(), {id: value.id});
        //         }));
        //     });
    }

    addnote(note: Patientnote): any {
        note.admin = {
            _id: this.adminservice.userdata._id,
            name: this.adminservice.userdata.data.displayName
        };
        note.patientId = this.patientid;
        const meta: Meta = {
            date: moment().toDate(),
            adminId: this.adminservice.userdata._id,
            hospitalId: this.hospitalservice.activehospital.value._id
        };
        note.metadata = {
           created: meta,
           edited: meta,
        };
        // return this.db.collection('patientnotes').add(note);

    }

    editnote(): void {

    }
}
