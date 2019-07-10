import {Injectable} from '@angular/core';
import {QueueService} from './queue.service';
import {BehaviorSubject} from 'rxjs';
import {emptynote, Patientnote} from '../../models/patient/Patientnote';
import {AdminService} from './admin.service';
import * as moment from 'moment';

@Injectable({
    providedIn: 'root'
})
export class PatientnotesService {
    patientnotes: BehaviorSubject<Array<Patientnote>> = new BehaviorSubject<Array<Patientnote>>([]);
    patientid: string;

    constructor(private queueservice: QueueService,
                private admiservice: AdminService) {
        queueservice.currentpatient.subscribe(value => {
            if (value.patientdata._id) {
                this.patientid = value.patientdata._id;
                this.fetchpatientnotes(value.patientdata._id);
            }
        });
    }

    fetchpatientnotes(id: string): void {
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
            id: this.admiservice.userdata._id,
            name: this.admiservice.userdata.data.displayName
        };
        note.patientId = this.patientid;
        note.metadata = {
            lastEdit: moment().toDate(),
            date: moment().toDate()
        };
        // return this.db.collection('patientnotes').add(note);

    }

    editnote(): void {

    }
}
