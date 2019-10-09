import {Component, OnInit} from '@angular/core';
import {LocalcommunicationService} from '../localcommunication.service';
import * as moment from 'moment';
import {QueueService} from '../../../../services/queue.service';
import {emptymergedQueueModel, MergedPatientQueueModel} from '../../../../../models/visit/MergedPatientQueueModel';

@Component({
    selector: 'current-patients-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
    patient: MergedPatientQueueModel = {...emptymergedQueueModel};
    activepage: string = 'generaldetails';

    constructor(private communication: LocalcommunicationService, private queueservice: QueueService) {
        queueservice.currentpatient.subscribe(patient => {
            this.patient = patient;
        });
        communication.onactivechildpagechanged.subscribe(page => {
            this.activepage = page;
        });
    }

    changeactivepage(page: string): void {
        this.communication.onactivechildpagechanged.next(page);
    }

    getage(dob): number {
        return moment().diff(dob, 'years');
    }

    ngOnInit(): void {
    }

    timediff() {
        moment().fromNow();
    }

}
